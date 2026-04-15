from typing import Any

from bson import ObjectId
from bson.errors import InvalidId

from app.core.password_hash import hash_password, verify_password
from app.db import get_db

async def get_user_by_email(email: str) -> dict[str, Any] | None:
    doc = await get_db().users.find_one({"email": email.lower()})
    return doc


async def get_user_by_username(username: str) -> dict[str, Any] | None:
    doc = await get_db().users.find_one({"username": username.lower()})
    return doc


async def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    try:
        oid = ObjectId(user_id)
    except InvalidId:
        return None
    return await get_db().users.find_one({"_id": oid})


async def create_user(username: str, email: str, password: str) -> dict[str, Any]:
    doc = {
        "username": username.lower(),
        "email": email.lower(),
        "password_hash": hash_password(password),
    }
    result = await get_db().users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc
