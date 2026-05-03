from datetime import datetime, timezone

from app.db import get_db
from app.schemas.routines import RoutineItem, TodayRoutinesResponse

STATIC_ROUTINES = [
    {"id": "routine-walk", "title": "식사 후 10분 가벼운 걷기"},
    {"id": "routine-talk", "title": "하루 한 번 가족 또는 지인과 대화하기"},
    {"id": "routine-sleep", "title": "취침 전 밝은 화면 줄이고 수면 준비하기"},
]


def _today_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


async def get_today_routines(user_id: str) -> TodayRoutinesResponse:
    db = get_db()
    today = _today_str()

    cursor = db.routine_completions.find(
        {"user_id": user_id, "date": today},
        {"routine_id": 1},
    )
    completed_ids: set[str] = set()
    async for doc in cursor:
        completed_ids.add(doc["routine_id"])

    items = [
        RoutineItem(
            id=routine["id"],
            title=routine["title"],
            completed=routine["id"] in completed_ids,
        )
        for routine in STATIC_ROUTINES
    ]

    return TodayRoutinesResponse(items=items)
