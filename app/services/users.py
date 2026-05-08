from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone

from app.core.password_hash import hash_password, verify_password
from app.db import get_db

async def get_user_by_email(email: str) -> dict[str, Any] | None:
    doc = await get_db().users.find_one({"email": email.lower()})
    return doc

async def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    try:
        oid = ObjectId(user_id)
    except InvalidId:
        return None
    return await get_db().users.find_one({"_id": oid})


async def create_social_user(
    *,
    email: str,
    name: str | None,
    provider: str,
    provider_user_id: str,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    doc = {
        "email": email.lower(),
        "name": name,
        "password_hash": None,
        "provider": provider,
        "providers": [
            {
                "provider": provider,
                "provider_user_id": provider_user_id,
                "linked_at": now,
            }
        ],
        "created_at": now,
        "updated_at": now,
    }
    result = await get_db().users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def link_social_provider(
    *,
    user_id: str,
    provider: str,
    provider_user_id: str,
) -> None:
    now = datetime.now(timezone.utc)
    oid = ObjectId(user_id)

    existing = await get_db().users.update_one(
        {
            "_id": oid,
            "providers": {
                "$elemMatch": {
                    "provider": provider,
                    "provider_user_id": provider_user_id,
                }
            },
        },
        {"$set": {"updated_at": now}},
    )
    if existing.matched_count:
        return

    
    await get_db().users.update_one(
        {"_id": oid},
        {
            "$set": {"updated_at": now},
            "$push": {
                "providers": {
                    "provider": provider,
                    "provider_user_id": provider_user_id,
                    "linked_at": now,
                }
            },
        },
    )


async def create_user(
    email: str,
    password: str,
    *,
    name: str | None = None,
    provider: str = "local",
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    doc = {
        "email": email.lower(),
        "name": name,
        "password_hash": hash_password(password),
        "provider": provider,
        "providers": [
            {
                "provider": provider,
                "provider_user_id": email.lower(),
                "linked_at": now,
            }
        ],
        "created_at": now,
        "updated_at": now,
    }
    result = await get_db().users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc
