import json
import logging
import os

logger = logging.getLogger(__name__)

_recommendations: dict | None = None
DATA_PATH = "app/data/persona_recommendations.json"

DEFAULT_PERSONA = "생활습관 불균형형"


def _load() -> dict:
    global _recommendations
    if _recommendations is not None:
        return _recommendations
    try:
        with open(DATA_PATH, encoding="utf-8") as f:
            _recommendations = json.load(f)
    except Exception as e:
        logger.warning("추천 데이터 로드 실패: %s", e)
        _recommendations = {}
    return _recommendations


def get_recommendations(persona: str) -> dict:
    data = _load()
    return data.get(persona, data.get(DEFAULT_PERSONA, {
        "dailyRoutines": ["규칙적인 생활 습관을 유지하세요"],
        "cognitiveTrainings": ["매일 독서나 퍼즐을 해보세요"],
        "lifestyleTips": ["가까운 치매안심센터를 방문해 보세요"],
    }))


def get_daily_routines(persona: str) -> list[str]:
    return get_recommendations(persona).get("dailyRoutines", [])


def get_cognitive_trainings(persona: str) -> list[str]:
    return get_recommendations(persona).get("cognitiveTrainings", [])


def get_lifestyle_tips(persona: str) -> list[str]:
    return get_recommendations(persona).get("lifestyleTips", [])
