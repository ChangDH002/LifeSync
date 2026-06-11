from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from app.db import get_db
from app.schemas.routines import (
    RoutineCompletionActionResponse,
    RoutineCompletionDocument,
    RoutineDefinitionDocument,
    RoutineHistoryDay,
    RoutineItem,
    RoutineWeeklyHistoryResponse,
    TodayRoutinesResponse,
    UserRoutineDocument,
)

FALLBACK_ROUTINE_TIMESTAMP = datetime(2026, 1, 1, tzinfo=timezone.utc)

ROUTINE_DEFINITION_CATALOG = [
    RoutineDefinitionDocument(
        routine_id="routine-walk",
        title="식사 후 10분 가벼운 걷기",
        category="exercise",
        description="식사 후 짧은 걷기로 신체 활동량을 꾸준히 늘립니다.",
        recommendation_reason_template="신체 활동은 인지 건강 유지에 도움이 되는 기본 루틴입니다.",
        target_factors=["physical_activity"],
        target_categories=["생활습관"],
        frequency="daily",
        default_priority=10,
        active=True,
        created_at=FALLBACK_ROUTINE_TIMESTAMP,
        updated_at=FALLBACK_ROUTINE_TIMESTAMP,
    ),
    RoutineDefinitionDocument(
        routine_id="routine-talk",
        title="하루 한 번 가족 또는 지인과 대화하기",
        category="social",
        description="가족, 친구, 지인과 짧게라도 대화하며 사회적 교류를 유지합니다.",
        recommendation_reason_template="사회적 교류는 정서 안정과 인지 자극에 도움이 됩니다.",
        target_factors=["social_engagement", "loneliness"],
        target_categories=["심리·신경"],
        frequency="daily",
        default_priority=20,
        active=True,
        created_at=FALLBACK_ROUTINE_TIMESTAMP,
        updated_at=FALLBACK_ROUTINE_TIMESTAMP,
    ),
    RoutineDefinitionDocument(
        routine_id="routine-sleep",
        title="취침 전 밝은 화면 줄이고 수면 준비하기",
        category="sleep",
        description="취침 전 화면 노출을 줄여 규칙적인 수면 습관을 만듭니다.",
        recommendation_reason_template="수면 관리는 뇌 건강과 일상 리듬 유지에 중요합니다.",
        target_factors=["insomnia"],
        target_categories=["심리·신경", "생활습관"],
        frequency="daily",
        default_priority=30,
        active=True,
        created_at=FALLBACK_ROUTINE_TIMESTAMP,
        updated_at=FALLBACK_ROUTINE_TIMESTAMP,
    ),
    RoutineDefinitionDocument(
        routine_id="routine-brain",
        title="하루 10분 기억·주의력 자극 활동하기",
        category="cognitive",
        description="간단한 퍼즐, 기억 회상, 숫자 맞추기 등 가벼운 인지 자극을 합니다.",
        recommendation_reason_template="인지 자극은 뇌 활성 유지에 도움이 되는 루틴입니다.",
        target_factors=["cognitive_activity"],
        target_categories=["생활습관"],
        frequency="daily",
        default_priority=15,
        active=True,
        created_at=FALLBACK_ROUTINE_TIMESTAMP,
        updated_at=FALLBACK_ROUTINE_TIMESTAMP,
    ),
    RoutineDefinitionDocument(
        routine_id="routine-fish",
        title="주 2회 이상 생선·견과류 섭취하기",
        category="nutrition",
        description="생선이나 견과류를 식단에 넣어 영양 균형을 맞춥니다.",
        recommendation_reason_template="식습관 개선은 대사·인지 건강 관리에 도움이 됩니다.",
        target_factors=["fish_intake"],
        target_categories=["생활습관", "심혈관·대사"],
        frequency="weekly",
        default_priority=25,
        active=True,
        created_at=FALLBACK_ROUTINE_TIMESTAMP,
        updated_at=FALLBACK_ROUTINE_TIMESTAMP,
    ),
    RoutineDefinitionDocument(
        routine_id="routine-mood",
        title="5분 호흡·가벼운 스트레칭으로 기분 환기하기",
        category="lifestyle",
        description="짧은 호흡과 스트레칭으로 긴장을 풀고 일상 리듬을 회복합니다.",
        recommendation_reason_template="정서 안정은 인지 건강과 수면 질에도 영향을 줍니다.",
        target_factors=["depression", "insomnia"],
        target_categories=["심리·신경"],
        frequency="daily",
        default_priority=35,
        active=True,
        created_at=FALLBACK_ROUTINE_TIMESTAMP,
        updated_at=FALLBACK_ROUTINE_TIMESTAMP,
    ),
]

FALLBACK_ROUTINE_DEFINITIONS = ROUTINE_DEFINITION_CATALOG[:3]


def _today_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _today_utc() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def _week_start_str(today: datetime) -> str:
    week_start = today - timedelta(days=today.weekday())
    return week_start.strftime("%Y-%m-%d")


def _resolve_date(date: str | None) -> str:
    if date is None:
        return _today_str()
    return date


def _user_routine_from_mongo(raw: dict) -> UserRoutineDocument:
    raw_without_id = {key: value for key, value in raw.items() if key != "_id"}
    return UserRoutineDocument.model_validate(raw_without_id)


def _routine_item_from_definition(
    routine: RoutineDefinitionDocument,
    completed_ids: set[str],
) -> RoutineItem:
    return RoutineItem(
        id=routine.routine_id,
        title=routine.title,
        completed=routine.routine_id in completed_ids,
        category=routine.category,
        description=routine.description,
        recommendationReason=routine.recommendation_reason_template,
        frequency=routine.frequency,
        priority=routine.default_priority,
        active=routine.active,
    )


def _routine_item_from_user_routine(
    routine: UserRoutineDocument,
    completed_ids: set[str],
) -> RoutineItem:
    return RoutineItem(
        id=routine.routine_id,
        title=routine.title,
        completed=routine.routine_id in completed_ids,
        category=routine.category,
        description=routine.description,
        recommendationReason=routine.recommendation_reason,
        frequency=routine.frequency,
        priority=routine.priority,
        active=routine.active,
    )


async def _get_completed_routine_ids(db, user_id: str, date: str) -> set[str]:
    cursor = db.routine_completions.find(
        {"user_id": user_id, "date": date},
        {"routine_id": 1},
    )
    completed_ids: set[str] = set()
    async for doc in cursor:
        completed_ids.add(doc["routine_id"])
    return completed_ids


async def _get_active_user_routines(db, user_id: str) -> list[UserRoutineDocument]:
    cursor = db.user_routines.find({"user_id": user_id, "active": True})
    cursor = cursor.sort("priority", 1)

    routines: list[UserRoutineDocument] = []
    async for doc in cursor:
        routines.append(_user_routine_from_mongo(doc))
    return routines


async def get_today_routines(user_id: str) -> TodayRoutinesResponse:
    db = get_db()
    today = _today_str()

    completed_ids = await _get_completed_routine_ids(db, user_id, today)
    user_routines = await _get_active_user_routines(db, user_id)

    if user_routines:
        items = [
            _routine_item_from_user_routine(routine, completed_ids)
            for routine in user_routines
        ]
    else:
        items = [
            _routine_item_from_definition(routine, completed_ids)
            for routine in FALLBACK_ROUTINE_DEFINITIONS
            if routine.active
        ]

    return TodayRoutinesResponse(
        items=sorted(
            items,
            key=lambda item: item.priority if item.priority is not None else 100,
        )
    )


async def _find_today_routine_item(user_id: str, routine_id: str) -> RoutineItem:
    today = await get_today_routines(user_id)
    for item in today.items:
        if item.id == routine_id:
            return item
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="오늘의 루틴 목록에 없는 routine_id입니다.",
    )


async def complete_routine(
    user_id: str,
    routine_id: str,
    *,
    date: str | None = None,
) -> RoutineCompletionActionResponse:
    target_date = _resolve_date(date)
    if target_date != _today_str():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="현재는 오늘 날짜의 루틴만 완료 처리할 수 있습니다.",
        )

    routine_item = await _find_today_routine_item(user_id, routine_id)
    db = get_db()
    now = datetime.now(timezone.utc)

    existing = await db.routine_completions.find_one(
        {"user_id": user_id, "routine_id": routine_id, "date": target_date},
    )
    if existing is not None:
        completed_at = existing.get("completed_at", now)
        if completed_at.tzinfo is None:
            completed_at = completed_at.replace(tzinfo=timezone.utc)
        return RoutineCompletionActionResponse(
            routineId=routine_id,
            date=target_date,
            completed=True,
            completedAt=completed_at,
        )

    completion = RoutineCompletionDocument(
        user_id=user_id,
        routine_id=routine_id,
        date=target_date,
        completed_at=now,
        routine_title_snapshot=routine_item.title,
        category_snapshot=routine_item.category,
    )
    await db.routine_completions.insert_one(completion.model_dump())

    watering_chance_granted = False
    # 일일 루틴 완료 시 물주기 기회 부여
    if routine_item.frequency == "daily":
        result = await db.watering_chances.update_one(
            {"user_id": user_id, "date": target_date},
            {"$setOnInsert": {"user_id": user_id, "date": target_date, "granted_at": now}},
            upsert=True,
        )
        watering_chance_granted = result.upserted_id is not None

    return RoutineCompletionActionResponse(
        routineId=routine_id,
        date=target_date,
        completed=True,
        completedAt=now,
        wateringChanceGranted=watering_chance_granted,
    )


async def cancel_routine_completion(
    user_id: str,
    routine_id: str,
    *,
    date: str | None = None,
) -> RoutineCompletionActionResponse:
    target_date = _resolve_date(date)
    if target_date != _today_str():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="현재는 오늘 날짜의 루틴 완료만 취소할 수 있습니다.",
        )

    await _find_today_routine_item(user_id, routine_id)
    db = get_db()
    result = await db.routine_completions.delete_one(
        {"user_id": user_id, "routine_id": routine_id, "date": target_date},
    )
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="완료 기록이 없습니다.",
        )

    return RoutineCompletionActionResponse(
        routineId=routine_id,
        date=target_date,
        completed=False,
        completedAt=None,
    )


async def _get_completion_ids_by_date(
    db,
    user_id: str,
    start_date: str,
    end_date: str,
) -> dict[str, set[str]]:
    cursor = db.routine_completions.find(
        {
            "user_id": user_id,
            "date": {"$gte": start_date, "$lte": end_date},
        },
        {"routine_id": 1, "date": 1},
    )
    by_date: dict[str, set[str]] = {}
    async for doc in cursor:
        by_date.setdefault(doc["date"], set()).add(doc["routine_id"])
    return by_date


async def get_weekly_routine_history(user_id: str) -> RoutineWeeklyHistoryResponse:
    today_dt = _today_utc()
    week_start = _week_start_str(today_dt)
    today = _today_str()

    today_routines = await get_today_routines(user_id)
    total_per_day = len(today_routines.items)

    db = get_db()
    completions_by_date = await _get_completion_ids_by_date(
        db, user_id, week_start, today
    )

    days: list[RoutineHistoryDay] = []
    cursor_date = datetime.strptime(week_start, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    end_date = datetime.strptime(today, "%Y-%m-%d").replace(tzinfo=timezone.utc)

    completed_slots = 0
    total_slots = 0

    while cursor_date <= end_date:
        date_str = cursor_date.strftime("%Y-%m-%d")
        completed_ids = completions_by_date.get(date_str, set())
        completed_count = len(completed_ids)
        days.append(
            RoutineHistoryDay(
                date=date_str,
                completedCount=completed_count,
                totalCount=total_per_day,
                completedRoutineIds=sorted(completed_ids),
            )
        )
        completed_slots += completed_count
        total_slots += total_per_day
        cursor_date += timedelta(days=1)

    weekly_rate = 0
    if total_slots > 0:
        weekly_rate = min(int(completed_slots / total_slots * 100), 100)

    return RoutineWeeklyHistoryResponse(
        weekStart=week_start,
        weekEnd=today,
        days=days,
        weeklyCompletionRate=weekly_rate,
        today=today_routines,
    )
