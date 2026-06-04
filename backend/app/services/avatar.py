from datetime import datetime, timezone

from app.db import get_db
from app.schemas.avatar import AvatarSchema, WaterTreeResponse

TREE_ID = "tree-ginkgo"
TREE_NAME = "은행나무"
TREE_TYPE = "ginkgo"
EXP_PER_WATER = 20
EXP_PER_STAGE = 100
MAX_STAGE = 6
MAX_EXPERIENCE = EXP_PER_STAGE * (MAX_STAGE - 1)  # 500


def _calc_stage(experience: int) -> int:
    return min(experience // EXP_PER_STAGE + 1, MAX_STAGE)


def _doc_to_schema(doc: dict, daily_watering_chance_available: bool) -> AvatarSchema:
    stage = _calc_stage(doc["experience"])
    return AvatarSchema(
        id=doc.get("avatar_id", TREE_ID),
        name=doc.get("name", TREE_NAME),
        level=stage,
        experience=doc["experience"],
        maxExperience=MAX_EXPERIENCE,
        waterCount=doc["water_count"],
        stage=stage,
        maxStage=MAX_STAGE,
        treeType=doc.get("tree_type", TREE_TYPE),
        dailyWateringChanceAvailable=daily_watering_chance_available,
    )


def _today_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


async def _get_or_create_avatar(user_id: str) -> dict:
    db = get_db()
    doc = await db.avatars.find_one({"user_id": user_id})
    if doc:
        return doc

    now = datetime.now(timezone.utc)
    new_doc = {
        "user_id": user_id,
        "avatar_id": TREE_ID,
        "name": TREE_NAME,
        "tree_type": TREE_TYPE,
        "experience": 0,
        "water_count": 0,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.avatars.insert_one(new_doc)
    new_doc["_id"] = result.inserted_id
    return new_doc


async def _is_watering_chance_available(user_id: str, date: str) -> bool:
    db = get_db()
    chance = await db.watering_chances.find_one({"user_id": user_id, "date": date})
    if chance is None:
        return False
    return not chance.get("watered", False)


async def get_my_avatar(user_id: str) -> AvatarSchema:
    doc = await _get_or_create_avatar(user_id)
    available = await _is_watering_chance_available(user_id, _today_str())
    return _doc_to_schema(doc, available)


async def water_tree(user_id: str) -> WaterTreeResponse:
    db = get_db()
    today = _today_str()

    chance_available = await _is_watering_chance_available(user_id, today)

    doc = await _get_or_create_avatar(user_id)

    if not chance_available:
        return WaterTreeResponse(
            used=False,
            wateringChanceRemaining=0,
            expGained=0,
            avatar=_doc_to_schema(doc, False),
        )

    now = datetime.now(timezone.utc)
    new_experience = min(doc["experience"] + EXP_PER_WATER, MAX_EXPERIENCE)
    new_water_count = doc["water_count"] + 1

    await db.avatars.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "experience": new_experience,
                "water_count": new_water_count,
                "updated_at": now,
            }
        },
    )

    await db.watering_chances.update_one(
        {"user_id": user_id, "date": today},
        {"$set": {"watered": True, "watered_at": now}},
    )

    updated_doc = {**doc, "experience": new_experience, "water_count": new_water_count}

    return WaterTreeResponse(
        used=True,
        wateringChanceRemaining=0,
        expGained=EXP_PER_WATER,
        avatar=_doc_to_schema(updated_doc, False),
    )
