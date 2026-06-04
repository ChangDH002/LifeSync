from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def upsert_session(
    db: AsyncIOMotorDatabase,
    *,
    session_id: str,
    user_id: str,
    new_messages: list[dict],
    title: str | None = None,
) -> None:
    """세션이 없으면 생성하고, 있으면 메시지만 추가한다."""
    now = _now_iso()
    await db.chat_sessions.update_one(
        {"session_id": session_id, "user_id": user_id},
        {
            "$setOnInsert": {
                "session_id": session_id,
                "user_id": user_id,
                "title": title or "",
                "created_at": now,
            },
            "$set": {"updated_at": now},
            "$push": {"messages": {"$each": new_messages}},
        },
        upsert=True,
    )


async def get_sessions_by_user(
    db: AsyncIOMotorDatabase,
    *,
    user_id: str,
    limit: int = 20,
) -> list[dict]:
    """사용자의 세션 목록을 최신순으로 반환한다 (메시지 본문 제외)."""
    cursor = (
        db.chat_sessions.find(
            {"user_id": user_id},
            {
                "_id": 0,
                "session_id": 1,
                "title": 1,
                "updated_at": 1,
                "message_count": {"$size": "$messages"},
            },
        )
        .sort("updated_at", -1)
        .limit(limit)
    )
    return await cursor.to_list(length=limit)


async def get_session(
    db: AsyncIOMotorDatabase,
    *,
    session_id: str,
    user_id: str,
) -> dict | None:
    """단일 세션과 전체 메시지를 반환한다."""
    return await db.chat_sessions.find_one(
        {"session_id": session_id, "user_id": user_id},
        {"_id": 0},
    )
