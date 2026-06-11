import logging
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone
from pymongo.errors import DuplicateKeyError

from app.core.password_hash import hash_password, verify_password
from app.db import get_db

from app.schemas.user import UserProfile
logger = logging.getLogger(__name__)


async def seed_dev_user() -> None:
    """옵션이 켜진 경우에만 개발용 테스트 계정을 생성하거나 갱신합니다."""
    from app.core.config import settings

    if not settings.enable_dev_seed_user:
        return

    if not settings.dev_seed_email or not settings.dev_seed_password:
        logger.warning("ENABLE_DEV_SEED_USER=true 이지만 DEV_SEED_EMAIL/DEV_SEED_PASSWORD가 비어 있습니다.")
        return

    try:
        existing = await get_db().users.find_one({"email": settings.dev_seed_email})
        if existing is None:
            await create_user(
                settings.dev_seed_email,
                settings.dev_seed_password,
                name=settings.dev_seed_name,
            )
            logger.info("개발용 테스트 계정 생성 완료: %s", settings.dev_seed_email)
        else:
            await get_db().users.update_one(
                {"email": settings.dev_seed_email},
                {"$set": {
                    "password_hash": hash_password(settings.dev_seed_password),
                    "updated_at": datetime.now(timezone.utc),
                }},
            )
            logger.info("개발용 테스트 계정 비밀번호 갱신 완료: %s", settings.dev_seed_email)
    except Exception as e:
        logger.warning("개발용 테스트 계정 처리 실패 (무시): %s", e)

async def get_user_by_email(email: str) -> dict[str, Any] | None:
    doc = await get_db().users.find_one({"email": email.lower()})
    return doc

async def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    try:
        oid = ObjectId(user_id)
    except InvalidId:
        return None
    return await get_db().users.find_one({"_id": oid})


def _user_doc_to_profile(doc: dict) -> UserProfile:
    return UserProfile(
        id=str(doc["_id"]),
        email=doc["email"],
        name=doc.get("name", ""),
    )


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
