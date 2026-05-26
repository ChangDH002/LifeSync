import asyncio
from datetime import datetime, timezone

import pytest
from fastapi import HTTPException

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


def _matches_query(row: dict, query: dict) -> bool:
    for key, expected in query.items():
        value = row.get(key)
        if isinstance(expected, dict):
            if "$gte" in expected and (value is None or value < expected["$gte"]):
                return False
            if "$lte" in expected and (value is None or value > expected["$lte"]):
                return False
        elif value != expected:
            return False
    return True


class FakeCollection:
    def __init__(self, rows):
        self.rows = list(rows)

    def find(self, query, projection=None):
        matched = [row for row in self.rows if _matches_query(row, query)]
        if projection:
            projected = []
            for row in matched:
                projected.append({key: row[key] for key in projection if key in row})
            matched = projected
        return FakeCursor(matched)

    async def find_one(self, query):
        for row in self.rows:
            if _matches_query(row, query):
                return row
        return None

    async def insert_one(self, doc):
        self.rows.append(doc)
        return type("Result", (), {"inserted_id": "completion-1"})()

    async def delete_one(self, query):
        for index, row in enumerate(self.rows):
            if _matches_query(row, query):
                del self.rows[index]
                return type("Result", (), {"deleted_count": 1})()
        return type("Result", (), {"deleted_count": 0})()


class FakeDb:
    def __init__(self, *, user_routines=None, routine_completions=None):
        self.user_routines = FakeCollection(user_routines or [])
        self.routine_completions = FakeCollection(routine_completions or [])


def test_complete_routine_inserts_completion_and_updates_today_view(monkeypatch):
    fake_db = FakeDb(user_routines=[], routine_completions=[])
    monkeypatch.setattr(routines_service, "get_db", lambda: fake_db)
    monkeypatch.setattr(routines_service, "_today_str", lambda: "2026-05-22")

    result = asyncio.run(
        routines_service.complete_routine("user-1", "routine-walk")
    )

    assert result.completed is True
    assert result.routineId == "routine-walk"
    assert result.date == "2026-05-22"
    assert len(fake_db.routine_completions.rows) == 1
    assert fake_db.routine_completions.rows[0]["routine_title_snapshot"]

    today = asyncio.run(routines_service.get_today_routines("user-1"))
    walk = next(item for item in today.items if item.id == "routine-walk")
    assert walk.completed is True


def test_complete_routine_is_idempotent(monkeypatch):
    completed_at = datetime(2026, 5, 22, 8, 0, tzinfo=timezone.utc)
    fake_db = FakeDb(
        routine_completions=[
            {
                "user_id": "user-1",
                "routine_id": "routine-walk",
                "date": "2026-05-22",
                "completed_at": completed_at,
            }
        ]
    )
    monkeypatch.setattr(routines_service, "get_db", lambda: fake_db)
    monkeypatch.setattr(routines_service, "_today_str", lambda: "2026-05-22")

    result = asyncio.run(
        routines_service.complete_routine("user-1", "routine-walk")
    )

    assert result.completed is True
    assert result.completedAt == completed_at
    assert len(fake_db.routine_completions.rows) == 1


def test_cancel_routine_completion_removes_record(monkeypatch):
    fake_db = FakeDb(
        routine_completions=[
            {
                "user_id": "user-1",
                "routine_id": "routine-walk",
                "date": "2026-05-22",
                "completed_at": datetime(2026, 5, 22, tzinfo=timezone.utc),
            }
        ]
    )
    monkeypatch.setattr(routines_service, "get_db", lambda: fake_db)
    monkeypatch.setattr(routines_service, "_today_str", lambda: "2026-05-22")

    result = asyncio.run(
        routines_service.cancel_routine_completion("user-1", "routine-walk")
    )

    assert result.completed is False
    assert fake_db.routine_completions.rows == []

    today = asyncio.run(routines_service.get_today_routines("user-1"))
    walk = next(item for item in today.items if item.id == "routine-walk")
    assert walk.completed is False


def test_cancel_routine_completion_returns_404_when_missing(monkeypatch):
    fake_db = FakeDb(routine_completions=[])
    monkeypatch.setattr(routines_service, "get_db", lambda: fake_db)
    monkeypatch.setattr(routines_service, "_today_str", lambda: "2026-05-22")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            routines_service.cancel_routine_completion("user-1", "routine-walk")
        )

    assert exc_info.value.status_code == 404


def test_complete_unknown_routine_returns_404(monkeypatch):
    fake_db = FakeDb()
    monkeypatch.setattr(routines_service, "get_db", lambda: fake_db)
    monkeypatch.setattr(routines_service, "_today_str", lambda: "2026-05-22")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            routines_service.complete_routine("user-1", "routine-unknown")
        )

    assert exc_info.value.status_code == 404


def test_weekly_history_aggregates_completion_counts(monkeypatch):
    fake_db = FakeDb(
        routine_completions=[
            {
                "user_id": "user-1",
                "routine_id": "routine-walk",
                "date": "2026-05-20",
            },
            {
                "user_id": "user-1",
                "routine_id": "routine-talk",
                "date": "2026-05-22",
            },
        ]
    )
    monkeypatch.setattr(routines_service, "get_db", lambda: fake_db)
    monkeypatch.setattr(routines_service, "_today_str", lambda: "2026-05-22")
    monkeypatch.setattr(
        routines_service,
        "_today_utc",
        lambda: datetime(2026, 5, 22, tzinfo=timezone.utc),
    )

    history = asyncio.run(routines_service.get_weekly_routine_history("user-1"))

    assert history.weekStart == "2026-05-18"
    assert history.weekEnd == "2026-05-22"
    assert len(history.days) == 5
    assert history.days[-1].completedCount == 1
    assert history.days[-1].totalCount == 3
    assert history.weeklyCompletionRate >= 0
