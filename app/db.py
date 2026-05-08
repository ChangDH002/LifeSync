from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    if _client is None:
        raise RuntimeError("Database client is not initialized")
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[settings.database_name]


async def connect_db() -> None:
    global _client
    _client = AsyncIOMotorClient(
        settings.mongodb_url,
        serverSelectionTimeoutMS=5000,
    )
    await _client.admin.command("ping")
    db = get_db()
    await db.users.create_index("email", unique=True)
    await db.users.create_index([("providers.provider", 1), ("providers.provider_user_id", 1)])
    await db.refresh_tokens.create_index([("user_id", 1), ("jti_hash", 1)], unique=True)
    await db.refresh_tokens.create_index("expires_at")
    await db.attendance_logs.create_index([("user_id", 1), ("date", 1)], unique=True)
    await db.watering_chances.create_index([("user_id", 1), ("date", 1)], unique=True)
    await db.training_events.create_index([("user_id", 1), ("occurred_at", -1)])
    await db.avatars.create_index("user_id", unique=True)
    await db.routine_completions.create_index(
        [("user_id", 1), ("routine_id", 1), ("date", 1)], unique=True
    )
    await db.chat_sessions.create_index("session_id", unique=True)
    await db.chat_sessions.create_index([("user_id", 1), ("updated_at", -1)])


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
