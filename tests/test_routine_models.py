import asyncio
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.routines import RoutineDefinitionDocument, UserRoutineDocument
from app.services import routines as routines_service


class FakeCursor:
    def __init__(self, rows):
        self.rows = list(rows)
        self.index = 0

    def sort(self, field: str, direction: int):
        reverse = direction < 0
        self.rows.sort(key=lambda row: row.get(field, 0), reverse=reverse)
        return self

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.index >= len(self.rows):
            raise StopAsyncIteration
        row = self.rows[self.index]
        self.index += 1
        return row


class FakeCollection:
    def __init__(self, rows):
        self.rows = rows

    def find(self, query, projection=None):
        rows = []
        for row in self.rows:
            if all(row.get(key) == value for key, value in query.items()):
                if projection:
                    rows.append({key: row[key] for key in projection if key in row})
                else:
                    rows.append(row)
        return FakeCursor(rows)


class FakeDb:
    def __init__(self, *, user_routines=None, routine_completions=None):
        self.user_routines = FakeCollection(user_routines or [])
        self.routine_completions = FakeCollection(routine_completions or [])


def _now():
    return datetime(2026, 5, 22, tzinfo=timezone.utc)


def _user_routine(**overrides):
    payload = {
        "user_id": "user-1",
        "routine_id": "routine-custom-walk",
        "title": "맞춤 걷기",
        "category": "exercise",
        "description": "오늘 15분 걷기",
        "recommendation_reason": "신체 활동 점수가 낮아 우선 추천합니다.",
        "frequency": "daily",
        "priority": 10,
        "active": True,
        "source": "survey",
        "source_survey_submitted_at": _now(),
        "source_survey_version": "dementia-risk-v1",
        "source_scoring_version": "cogdrisk-anuadri-v1",
        "risk_level_snapshot": "위험도 보통",
        "category_scores_snapshot": {"생활습관": 5.0},
        "assigned_at": _now(),
        "updated_at": _now(),
        "deactivated_at": None,
    }
    payload.update(overrides)
    return payload


def test_routine_definition_document_requires_expected_fields():
    definition = RoutineDefinitionDocument(
        routine_id="routine-walk",
        title="걷기",
        category="exercise",
        description="가볍게 걷기",
        recommendation_reason_template="신체 활동 추천",
        target_factors=["physical_activity"],
        target_categories=["생활습관"],
        frequency="daily",
        default_priority=10,
        active=True,
        created_at=_now(),
        updated_at=_now(),
    )

    assert definition.routine_id == "routine-walk"
    assert definition.category == "exercise"


def test_user_routine_document_rejects_unknown_fields():
    payload = _user_routine(extra_field="invalid")

    with pytest.raises(ValidationError):
        UserRoutineDocument.model_validate(payload)


def test_today_routines_falls_back_when_user_has_no_routines(monkeypatch):
    fake_db = FakeDb(
        user_routines=[],
        routine_completions=[{"user_id": "user-1", "routine_id": "routine-walk", "date": routines_service._today_str()}],
    )
    monkeypatch.setattr(routines_service, "get_db", lambda: fake_db)

    response = asyncio.run(routines_service.get_today_routines("user-1"))

    assert len(response.items) == 3
    assert response.items[0].id == "routine-walk"
    assert response.items[0].completed is True
    assert response.items[0].category == "exercise"
    assert response.items[0].recommendationReason


def test_today_routines_prefers_active_user_routines(monkeypatch):
    fake_db = FakeDb(
        user_routines=[
            _user_routine(routine_id="routine-late", title="늦은 루틴", priority=20),
            _user_routine(routine_id="routine-early", title="우선 루틴", priority=5),
            _user_routine(routine_id="routine-inactive", title="비활성 루틴", active=False, priority=1),
        ],
        routine_completions=[{"user_id": "user-1", "routine_id": "routine-early", "date": routines_service._today_str()}],
    )
    monkeypatch.setattr(routines_service, "get_db", lambda: fake_db)

    response = asyncio.run(routines_service.get_today_routines("user-1"))

    assert [item.id for item in response.items] == ["routine-early", "routine-late"]
    assert response.items[0].completed is True
    assert response.items[0].description == "오늘 15분 걷기"
    assert response.items[0].recommendationReason == "신체 활동 점수가 낮아 우선 추천합니다."
