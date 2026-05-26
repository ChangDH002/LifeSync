from datetime import datetime, timezone

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.schemas.survey import DementiaSurveyResultDocument, DementiaSurveySubmitRequest
from app.services.survey import (
    DEFAULT_SURVEY_VERSION,
    SCORING_VERSION,
    _survey_document_from_mongo,
    build_dementia_risk_survey_document,
)


def _valid_request(**overrides) -> DementiaSurveySubmitRequest:
    payload = {
        "surveyType": "dementia-risk",
        "surveyVersion": "frontend-survey-v1",
        "clientVersion": "test-client",
        "totalScore": 999,
        "riskLevel": "위험도 낮음",
        "categoryScores": {"생활습관": 999},
        "responses": {
            "age": 70,
            "sex": "female",
            "education_level": "low",
            "has_diabetes": True,
            "physical_activity": "low",
            "cognitive_activity": "low",
            "fish_intake": "none",
            "smoking_status": "current",
        },
    }
    payload.update(overrides)
    return DementiaSurveySubmitRequest(**payload)


def test_survey_document_uses_server_score_instead_of_client_score():
    doc = build_dementia_risk_survey_document(
        user_id="user-1",
        req=_valid_request(),
        submitted_at=datetime(2026, 5, 22, tzinfo=timezone.utc),
    )

    assert isinstance(doc, DementiaSurveyResultDocument)
    assert doc.total_score == doc.final_risk_score
    assert doc.total_score != 999
    assert doc.risk_level != "위험도 낮음"
    assert doc.category_scores != {"생활습관": 999}
    assert doc.client_submitted.total_score == 999
    assert doc.score_mismatch is True


def test_survey_document_adds_version_metadata_and_append_policy():
    doc = build_dementia_risk_survey_document(
        user_id="user-1",
        req=_valid_request(surveyVersion=None, clientVersion=None),
        submitted_at=datetime(2026, 5, 22, tzinfo=timezone.utc),
    )

    assert doc.survey_version == DEFAULT_SURVEY_VERSION
    assert doc.scoring_version == SCORING_VERSION
    assert doc.client_version is None
    assert doc.submission_policy == "append_history"


def test_survey_document_builds_server_category_scores():
    doc = build_dementia_risk_survey_document(
        user_id="user-1",
        req=_valid_request(),
        submitted_at=datetime(2026, 5, 22, tzinfo=timezone.utc),
    )

    assert set(doc.category_scores) == {"인구통계", "심혈관·대사", "심리·신경", "생활습관"}
    assert all(isinstance(score, float) for score in doc.category_scores.values())
    assert doc.response_count == len(doc.normalized_responses)


def test_survey_document_tracks_ignored_fields():
    doc = build_dementia_risk_survey_document(
        user_id="user-1",
        req=_valid_request(
            responses={
                "age": 70,
                "sex": "female",
                "education_level": "low",
                "has_diabetes": True,
                "physical_activity": "low",
                "cognitive_activity": "low",
                "fish_intake": "none",
                "unknown_field": "ignored",
            }
        ),
        submitted_at=datetime(2026, 5, 22, tzinfo=timezone.utc),
    )

    assert doc.response_count == len(doc.normalized_responses)
    assert doc.ignored_fields == ["unknown_field"]


def test_survey_document_model_rejects_missing_required_fields():
    valid_doc = build_dementia_risk_survey_document(
        user_id="user-1",
        req=_valid_request(),
        submitted_at=datetime(2026, 5, 22, tzinfo=timezone.utc),
    ).model_dump()
    valid_doc.pop("survey_version")

    with pytest.raises(ValidationError):
        DementiaSurveyResultDocument.model_validate(valid_doc)


def test_survey_document_from_mongo_excludes_object_id():
    doc = build_dementia_risk_survey_document(
        user_id="user-1",
        req=_valid_request(),
        submitted_at=datetime(2026, 5, 22, tzinfo=timezone.utc),
    )
    raw = doc.model_dump()
    raw["_id"] = "mongo-object-id"

    parsed = _survey_document_from_mongo(raw)

    assert parsed == doc


def test_survey_submission_rejects_wrong_survey_type():
    with pytest.raises(HTTPException) as exc_info:
        build_dementia_risk_survey_document(
            user_id="user-1",
            req=_valid_request(surveyType="unknown"),
            submitted_at=datetime(2026, 5, 22, tzinfo=timezone.utc),
        )

    assert exc_info.value.status_code == 400


def test_survey_submission_requires_core_answers():
    with pytest.raises(HTTPException) as exc_info:
        build_dementia_risk_survey_document(
            user_id="user-1",
            req=_valid_request(responses={"age": 70, "has_diabetes": True}),
            submitted_at=datetime(2026, 5, 22, tzinfo=timezone.utc),
        )

    assert exc_info.value.status_code == 400
