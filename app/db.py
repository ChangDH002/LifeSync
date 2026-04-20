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
    await db.users.create_index("username", unique=True, sparse=True)


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
