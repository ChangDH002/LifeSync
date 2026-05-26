import asyncio
from datetime import datetime, timezone

from app.schemas.survey import (
    ClientSubmittedSurveyScore,
    DementiaSurveyResultDocument,
    SurveyScoreToolDocument,
)
from app.services import routine_recommendation as recommendation_service
def _manual_survey(**overrides) -> DementiaSurveyResultDocument:
    payload = {
        "user_id": "user-1",
        "survey_type": "dementia-risk",
        "survey_version": "dementia-risk-v1",
        "scoring_version": "cogdrisk-anuadri-v1",
        "client_version": None,
        "total_score": 55.0,
        "risk_level": "위험도 보통",
        "final_risk_score": 55.0,
        "category_scores": {
            "인구통계": 1.0,
            "심혈관·대사": 2.0,
            "심리·신경": 8.0,
            "생활습관": 12.0,
        },
        "responses": {},
        "normalized_responses": {
            "age": 70,
            "sex": "female",
            "physical_activity": "low",
            "cognitive_activity": "low",
            "loneliness": "high",
            "insomnia": True,
        },
        "ignored_fields": [],
        "client_submitted": ClientSubmittedSurveyScore(),
        "score_mismatch": False,
        "score_delta": None,
        "submission_policy": "append_history",
        "cogdrisk": SurveyScoreToolDocument(
            raw_score=1.0,
            normalized_score=50.0,
            matched_factors={},
        ),
        "anu_adri": SurveyScoreToolDocument(
            raw_score=1.0,
            normalized_score=50.0,
            matched_factors={},
        ),
        "response_count": 6,
        "submitted_at": datetime(2026, 5, 22, tzinfo=timezone.utc),
        "created_at": datetime(2026, 5, 22, tzinfo=timezone.utc),
    }
    payload.update(overrides)
    return DementiaSurveyResultDocument(**payload)


def test_selects_walk_and_brain_for_low_activity_profile():
    survey = _manual_survey()
    selected = recommendation_service.select_routine_definitions_for_survey(survey)
    routine_ids = [item[0].routine_id for item in selected]

    assert "routine-walk" in routine_ids
    assert "routine-brain" in routine_ids
    assert len(selected) == 3


def test_recommendation_reason_mentions_factor_when_relevant():
    survey = _manual_survey()
    selected = recommendation_service.select_routine_definitions_for_survey(survey)
    walk = next(item for item in selected if item[0].routine_id == "routine-walk")

    assert "신체 활동" in walk[2]


def test_build_user_routine_documents_carries_survey_snapshot():
    survey = _manual_survey()
    documents = recommendation_service.build_user_routine_documents("user-1", survey)

    assert len(documents) == 3
    assert documents[0].source == "survey"
    assert documents[0].risk_level_snapshot == "위험도 보통"
    assert documents[0].category_scores_snapshot["생활습관"] == 12.0


class FakeCollection:
    def __init__(self, rows):
        self.rows = list(rows)

    async def update_many(self, query, update):
        now = update["$set"]["updated_at"]
        for row in self.rows:
            if all(row.get(key) == value for key, value in query.items()):
                row.update(update["$set"])
                row["active"] = update["$set"]["active"]
                if not row["active"]:
                    row["deactivated_at"] = now

    async def insert_many(self, docs):
        self.rows.extend(docs)

    def find(self, query):
        from tests.test_routine_models import FakeCursor

        rows = [row for row in self.rows if all(row.get(k) == v for k, v in query.items())]
        return FakeCursor(rows)


class FakeDb:
    def __init__(self, *, user_routines=None, routine_definitions=None):
        self.user_routines = FakeCollection(user_routines or [])
        self.routine_definitions = FakeCollection(routine_definitions or [])


def test_assign_deactivates_previous_survey_routines_and_inserts_new(monkeypatch):
    fake_db = FakeDb(
        user_routines=[
            {
                "user_id": "user-1",
                "routine_id": "routine-old",
                "active": True,
                "source": "survey",
                "priority": 1,
            }
        ]
    )
    monkeypatch.setattr(recommendation_service, "get_db", lambda: fake_db)

    survey = _manual_survey()
    assigned = asyncio.run(
        recommendation_service.assign_user_routines_from_survey("user-1", survey)
    )

    assert len(assigned) == 3
    active_rows = [row for row in fake_db.user_routines.rows if row.get("active")]
    assert len(active_rows) == 3
    assert all(row["source"] == "survey" for row in active_rows)
    inactive = [row for row in fake_db.user_routines.rows if not row.get("active")]
    assert len(inactive) == 1
    assert inactive[0]["routine_id"] == "routine-old"


def test_survey_save_triggers_routine_assignment(monkeypatch):
    inserted: list[dict] = []
    assigned_surveys: list[DementiaSurveyResultDocument] = []

    class SurveyResults:
        async def insert_one(self, doc):
            inserted.append(doc)
            return type("Result", (), {"inserted_id": "survey-1"})()

    class FakeSurveyDb:
        survey_results = SurveyResults()

    async def fake_assign(user_id, survey):
        assigned_surveys.append(survey)

    monkeypatch.setattr(
        "app.services.survey.routine_recommendation_service.assign_user_routines_from_survey",
        fake_assign,
    )
    monkeypatch.setattr("app.services.survey.get_db", lambda: FakeSurveyDb())

    from app.services.survey import save_dementia_risk_survey
    from tests.test_survey_scoring import _valid_request

    asyncio.run(
        save_dementia_risk_survey(
            "user-1",
            _valid_request(),
        )
    )

    assert len(inserted) == 1
    assert len(assigned_surveys) == 1
    assert assigned_surveys[0].user_id == "user-1"
