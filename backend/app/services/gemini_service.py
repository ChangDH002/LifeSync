import logging
from typing import Any

logger = logging.getLogger(__name__)

SAFETY_NOTICE = "본 서비스는 의료적 진단을 제공하지 않습니다."

_gemini_client = None
_gemini_available: bool | None = None


def _get_client():
    global _gemini_client, _gemini_available
    if _gemini_available is not None:
        return _gemini_client

    from app.core.config import settings

    if not settings.gemini_api_key:
        _gemini_available = False
        _gemini_client = None
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        _gemini_client = genai.GenerativeModel(settings.gemini_model)
        _gemini_available = True
        return _gemini_client
    except Exception as e:
        logger.warning("Gemini 초기화 실패: %s", e)
        _gemini_available = False
        _gemini_client = None
        return None


def is_gemini_available() -> bool:
    return _get_client() is not None


def get_model_name() -> str:
    from app.core.config import settings
    return settings.gemini_model


def generate(prompt: str) -> tuple[str, bool]:
    """
    Returns (response_text, fallback_used).
    fallback_used=True when Gemini was unavailable or failed.
    """
    client = _get_client()
    if client is None:
        return _fallback_response(prompt), True

    try:
        response = client.generate_content(prompt)
        text = response.text.strip()
        if not text:
            return _fallback_response(prompt), True
        return text, False
    except Exception as e:
        logger.warning("Gemini 호출 실패: %s", e)
        return _fallback_response(prompt), True


def _fallback_response(prompt: str) -> str:
    prompt_lower = prompt.lower()
    if "운동" in prompt_lower:
        return (
            "규칙적인 신체 활동은 뇌 혈류를 늘려 인지 기능 유지에 도움을 줍니다. "
            "하루 30분 걷기부터 시작해 보시면 좋겠습니다. "
            "새로운 운동을 배우는 것도 뇌 자극에 효과적입니다."
        )
    if "수면" in prompt_lower or "잠" in prompt_lower:
        return (
            "충분하고 규칙적인 수면은 뇌의 노폐물 제거와 기억 정리에 중요합니다. "
            "매일 같은 시간에 자고 일어나는 습관을 만들어 보세요. "
            "취침 전 스마트폰 사용을 줄이면 수면의 질이 올라갑니다."
        )
    if "식습관" in prompt_lower or "음식" in prompt_lower or "식단" in prompt_lower:
        return (
            "등 푸른 생선, 견과류, 베리류, 녹색 채소가 뇌 건강에 도움이 된다고 알려져 있습니다. "
            "지중해식 식단을 참고하여 균형 잡힌 식사를 해 보세요. "
            "하루 6~8잔의 물을 마시는 것도 중요합니다."
        )
    if "인지" in prompt_lower or "두뇌" in prompt_lower or "퍼즐" in prompt_lower:
        return (
            "독서, 퍼즐, 새로운 취미 배우기 등 다양한 인지 자극 활동이 뇌 가소성을 높여줍니다. "
            "매일 조금씩 꾸준히 실천하는 것이 중요합니다. "
            "새로운 것을 배우는 활동일수록 더 큰 자극이 됩니다."
        )
    if "사회" in prompt_lower or "대화" in prompt_lower or "외로" in prompt_lower:
        return (
            "가족, 친구와의 정기적인 교류는 뇌를 지속적으로 자극하여 인지 기능 유지에 도움이 됩니다. "
            "지역 복지관이나 치매안심센터의 프로그램에 참여해 보시는 것도 좋습니다. "
            "전화나 영상통화로 자주 소통하는 것도 좋은 방법입니다."
        )
    return (
        "건강한 생활습관(규칙적인 운동, 균형 잡힌 식사, 충분한 수면, 사회적 교류)이 "
        "뇌 건강 유지에 큰 도움이 됩니다. "
        "걱정되시는 부분이 있다면 가까운 보건소 치매안심센터를 방문해 보세요."
    )


def generate_persona_response(
    risk_level: str,
    persona: str,
    main_risk_factors: list[str],
    survey_summary: str,
    context: str = "",
) -> tuple[str, bool]:
    prompt = (
        f"당신은 노인 생활 건강 도우미입니다. 진단이나 단정은 절대 하지 말고, "
        f"예방과 생활관리 중심으로 친근하고 따뜻한 말투로 3~6문장으로 답해주세요.\n\n"
        f"사용자 위험 수준: {risk_level}\n"
        f"생활 유형: {persona}\n"
        f"주요 위험 요인: {', '.join(main_risk_factors)}\n"
        f"설문 요약: {survey_summary}\n"
        f"참고 정보: {context}\n\n"
        f"위 내용을 바탕으로 이 분에게 맞는 생활 관리 조언을 해주세요. "
        f"마지막에 반드시 '{SAFETY_NOTICE}'를 포함해 주세요."
    )
    return generate(prompt)


def generate_chat_response(
    message: str,
    persona: str,
    risk_level: str,
    main_risk_factors: list[str],
    recommendations: list[str],
    context: str = "",
) -> tuple[str, bool]:
    prompt = (
        f"당신은 노인 생활 건강 도우미입니다. 진단이나 단정은 절대 하지 말고, "
        f"예방과 생활관리 중심으로 친근하고 따뜻한 말투로 3~6문장으로 답해주세요.\n\n"
        f"사용자 생활 유형: {persona}\n"
        f"위험 수준: {risk_level}\n"
        f"주요 위험 요인: {', '.join(main_risk_factors) if main_risk_factors else '없음'}\n"
        f"추천 활동: {', '.join(recommendations[:3]) if recommendations else '없음'}\n"
        f"참고 정보:\n{context}\n\n"
        f"사용자 질문: {message}"
    )
    return generate(prompt)
