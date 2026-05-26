from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.schemas.routines import RoutineItem, TodayRoutinesResponse
from app.services import mypage as mypage_service


def test_mypage_summary_uses_today_routine_counts():
    today_response = TodayRoutinesResponse(
        items=[
            RoutineItem(
                id="routine-walk",
                title="걷기",
                completed=True,
                active=True,
            ),
            RoutineItem(
                id="routine-talk",
                title="대화",
                completed=False,
                active=True,
            ),
            RoutineItem(
                id="routine-sleep",
                title="수면",
                completed=True,
                active=True,
            ),
        ]
    )

    with patch(
        "app.services.mypage.routines_service.get_today_routines",
        new=AsyncMock(return_value=today_response),
    ), patch(
        "app.services.mypage.survey_service.get_latest_dementia_risk_survey",
        new=AsyncMock(return_value=None),
    ), patch(
        "app.services.mypage._calc_streak",
        new=AsyncMock(return_value=1),
    ), patch(
        "app.services.mypage._calc_weekly_stats",
        new=AsyncMock(return_value=(14, 1)),
    ), patch(
        "app.services.mypage._get_recent_activities",
        new=AsyncMock(return_value=[]),
    ):
        response = __import__("asyncio").run(
            mypage_service.get_mypage_summary(
                user_id="user-1",
                user_doc={
                    "_id": "mongo-id",
                    "email": "user@example.com",
                    "name": "user",
                    "created_at": datetime(2026, 5, 1, tzinfo=timezone.utc),
                },
            )
        )

    assert response.summary.todayRoutineTotal == 3
    assert response.summary.todayRoutineCompleted == 2


class FakeCursor:
    def __init__(self, rows):
        self.rows = list(rows)
        self.index = 0

    def sort(self, field: str, direction: int):
        reverse = direction < 0
        self.rows.sort(key=lambda row: row.get(field), reverse=reverse)
        return self

    def limit(self, count: int):
        self.rows = self.rows[:count]
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

    def find(self, query):
        rows = [row for row in self.rows if row.get("user_id") == query.get("user_id")]
        return FakeCursor(rows)

    async def count_documents(self, query):
        return sum(1 for row in self.rows if row.get("user_id") == query.get("user_id"))


class FakeDb:
    def __init__(self):
        self.training_events = FakeCollection(
            [
                {
                    "user_id": "user-1",
                    "game_name": "기억력 카드",
                    "occurred_at": datetime(2026, 5, 22, 9, 0, tzinfo=timezone.utc),
                }
            ]
        )
        self.routine_completions = FakeCollection(
            [
                {
                    "user_id": "user-1",
                    "routine_id": "routine-walk",
                    "routine_title_snapshot": "식사 후 걷기",
                    "completed_at": datetime(2026, 5, 22, 10, 0, tzinfo=timezone.utc),
                }
            ]
        )


def test_weekly_stats_use_routine_completion_rate(monkeypatch):
    weekly_response = SimpleNamespace(weeklyCompletionRate=42)
    monkeypatch.setattr(
        mypage_service.routines_service,
        "get_weekly_routine_history",
        AsyncMock(return_value=weekly_response),
    )
    monkeypatch.setattr(mypage_service, "get_db", lambda: FakeDb())

    response = __import__("asyncio").run(
        mypage_service._calc_weekly_stats(
            "user-1",
            datetime(2026, 5, 18, tzinfo=timezone.utc),
        )
    )

    assert response == (42, 1)


def test_recent_activities_merge_routine_training_and_survey(monkeypatch):
    monkeypatch.setattr(mypage_service, "get_db", lambda: FakeDb())
    survey = SimpleNamespace(
        submitted_at=datetime(2026, 5, 22, 8, 0, tzinfo=timezone.utc),
    )

    activities = __import__("asyncio").run(
        mypage_service._get_recent_activities("user-1", latest_survey=survey)
    )

    assert [activity.type for activity in activities] == ["routine", "training", "survey"]
    assert activities[0].title == "식사 후 걷기 완료"
