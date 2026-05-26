from datetime import datetime, timezone
from unittest.mock import AsyncMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.jwt import create_access_token
from app.routers import routines
from app.schemas.routines import (
    RoutineCompletionActionResponse,
    RoutineHistoryDay,
    RoutineItem,
    RoutineWeeklyHistoryResponse,
    TodayRoutinesResponse,
)


def _app() -> FastAPI:
    app = FastAPI()
    app.include_router(routines.router, prefix="/routines")
    return app


def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(subject='user-1')}"}


def test_today_routines_requires_bearer_token():
    client = TestClient(_app())

    response = client.get("/routines/today")

    assert response.status_code == 401


def test_complete_routine_endpoint(monkeypatch):
    complete_mock = AsyncMock(
        return_value=RoutineCompletionActionResponse(
            routineId="routine-walk",
            date="2026-05-22",
            completed=True,
            completedAt=datetime(2026, 5, 22, tzinfo=timezone.utc),
        )
    )
    monkeypatch.setattr(routines.routines_service, "complete_routine", complete_mock)
    client = TestClient(_app())

    response = client.post("/routines/routine-walk/complete", headers=_headers())

    assert response.status_code == 200
    assert response.json()["completed"] is True
    complete_mock.assert_awaited_once_with("user-1", "routine-walk")


def test_cancel_routine_completion_endpoint(monkeypatch):
    cancel_mock = AsyncMock(
        return_value=RoutineCompletionActionResponse(
            routineId="routine-walk",
            date="2026-05-22",
            completed=False,
            completedAt=None,
        )
    )
    monkeypatch.setattr(
        routines.routines_service,
        "cancel_routine_completion",
        cancel_mock,
    )
    client = TestClient(_app())

    response = client.delete("/routines/routine-walk/complete", headers=_headers())

    assert response.status_code == 200
    assert response.json()["completed"] is False
    cancel_mock.assert_awaited_once_with("user-1", "routine-walk")


def test_weekly_history_endpoint_uses_static_route(monkeypatch):
    weekly_mock = AsyncMock(
        return_value=RoutineWeeklyHistoryResponse(
            weekStart="2026-05-18",
            weekEnd="2026-05-22",
            days=[
                RoutineHistoryDay(
                    date="2026-05-22",
                    completedCount=1,
                    totalCount=3,
                    completedRoutineIds=["routine-walk"],
                )
            ],
            weeklyCompletionRate=33,
            today=TodayRoutinesResponse(
                items=[
                    RoutineItem(
                        id="routine-walk",
                        title="걷기",
                        completed=True,
                    )
                ]
            ),
        )
    )
    monkeypatch.setattr(
        routines.routines_service,
        "get_weekly_routine_history",
        weekly_mock,
    )
    client = TestClient(_app())

    response = client.get("/routines/weekly", headers=_headers())

    assert response.status_code == 200
    assert response.json()["weeklyCompletionRate"] == 33
    weekly_mock.assert_awaited_once_with("user-1")
