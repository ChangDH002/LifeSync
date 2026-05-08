from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib

from app.core.config import settings
from app.db import get_db


def _hash_jti(jti: str) -> str:
    return hashlib.sha256(jti.encode("utf-8")).hexdigest()


async def store_refresh_token(*, user_id: str, jti: str, expires_at: datetime) -> None:
    doc = {
        "user_id": user_id,
        "jti_hash": _hash_jti(jti),
        "revoked": False,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    }
    await get_db().refresh_tokens.insert_one(doc)


async def is_refresh_token_active(*, user_id: str, jti: str) -> bool:
    now = datetime.now(timezone.utc)
    doc = await get_db().refresh_tokens.find_one(
        {
            "user_id": user_id,
            "jti_hash": _hash_jti(jti),
            "revoked": False,
            "expires_at": {"$gt": now},
        }
    )
    return doc is not None


async def revoke_refresh_token(*, user_id: str, jti: str) -> bool:
    result = await get_db().refresh_tokens.update_one(
        {"user_id": user_id, "jti_hash": _hash_jti(jti), "revoked": False},
        {"$set": {"revoked": True, "revoked_at": datetime.now(timezone.utc)}},
    )
    return result.modified_count > 0


def refresh_expires_at_from_now(days: int | None = None) -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        days=days or settings.refresh_token_expires_days
    )

