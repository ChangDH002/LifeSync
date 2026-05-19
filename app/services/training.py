from datetime import datetime, timezone

from app.db import get_db
from app.schemas.training import TrainingParticipationRequest, TrainingParticipationResponse


def _date_str(dt: datetime) -> str:
    """occurredAt 기준 UTC 날짜 문자열 반환 (예: '2026-04-20')"""
    utc_dt = dt.astimezone(timezone.utc) if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    return utc_dt.strftime("%Y-%m-%d")


async def record_participation(
    user_id: str, req: TrainingParticipationRequest
) -> TrainingParticipationResponse:
    db = get_db()
    now = datetime.now(timezone.utc)
    date = _date_str(req.occurredAt)

    metadata_dict = (
        req.metadata.model_dump() if req.metadata is not None else None
    )

    await db.training_events.insert_one(
        {
            "user_id": user_id,
            "game_category": req.gameCategory,
            "game_name": req.gameName,
            "event_type": req.eventType,
            "occurred_at": req.occurredAt,
            "attendance_candidate": req.attendanceCandidate,
            "watering_chance_candidate": req.wateringChanceCandidate,
            "metadata": metadata_dict,
            "created_at": now,
        }
    )

    completion_event = req.eventType == "completed"

    attendance_marked = False
    if completion_event and req.attendanceCandidate:
        result = await db.attendance_logs.update_one(
            {"user_id": user_id, "date": date},
            {"$setOnInsert": {"user_id": user_id, "date": date, "marked_at": now}},
            upsert=True,
        )
        attendance_marked = result.upserted_id is not None

    watering_chance_granted = False
    if completion_event and req.wateringChanceCandidate:
        result = await db.watering_chances.update_one(
            {"user_id": user_id, "date": date},
            {"$setOnInsert": {"user_id": user_id, "date": date, "granted_at": now}},
            upsert=True,
        )
        watering_chance_granted = result.upserted_id is not None

    today = now.strftime("%Y-%m-%d")
    daily_watering_chance_available = (
        await db.watering_chances.find_one({"user_id": user_id, "date": today}) is not None
    )

    return TrainingParticipationResponse(
        attendanceMarked=attendance_marked,
        wateringChanceGranted=watering_chance_granted,
        dailyWateringChanceAvailable=daily_watering_chance_available,
    )
