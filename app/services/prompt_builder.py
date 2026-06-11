SAFETY_NOTICE = "본 서비스는 의료적 진단을 제공하지 않습니다."


def build_persona_prompt(
    risk_level: str,
    risk_score: float,
    main_risk_factors: list[str],
    survey_summary: str,
    persona: str,
    context: str = "",
) -> str:
    return (
        f"당신은 노인 생활 건강 도우미입니다. 절대 진단하거나 단정하지 말고, "
        f"예방·생활관리 중심으로 따뜻하게 3~6문장으로 답해주세요.\n\n"
        f"위험 수준: {risk_level} (점수: {risk_score})\n"
        f"생활 유형: {persona}\n"
        f"주요 위험 요인: {', '.join(main_risk_factors)}\n"
        f"설문 요약: {survey_summary}\n"
        f"참고 정보: {context}\n\n"
        f"이 분에게 맞는 생활 관리 조언을 해주세요. "
        f"마지막에 반드시 '{SAFETY_NOTICE}'를 포함하세요."
    )


def build_chat_prompt(
    message: str,
    persona: str,
    risk_level: str,
    main_risk_factors: list[str],
    recommendations: list[str],
    context: str = "",
) -> str:
    factors_str = ", ".join(main_risk_factors) if main_risk_factors else "없음"
    recs_str = ", ".join(recommendations[:3]) if recommendations else "없음"
    return (
        f"당신은 노인 생활 건강 도우미입니다. 절대 진단하거나 단정하지 말고, "
        f"예방·생활관리 중심으로 친근하고 쉬운 말투로 3~6문장으로 답해주세요.\n\n"
        f"사용자 생활 유형: {persona}\n"
        f"위험 수준: {risk_level}\n"
        f"주요 위험 요인: {factors_str}\n"
        f"추천 활동: {recs_str}\n"
        f"참고 정보:\n{context}\n\n"
        f"사용자 질문: {message}\n\n"
        f"답변 마지막에 반드시 '{SAFETY_NOTICE}'를 포함하세요."
    )


def build_context_string(retrieved: list[dict]) -> str:
    if not retrieved:
        return ""
    parts = []
    for item in retrieved:
        q = item.get("question", "")
        a = item.get("answer", "")
        if q and a:
            parts.append(f"Q: {q}\nA: {a}")
    return "\n\n".join(parts)


def extract_related_topics(retrieved: list[dict]) -> list[str]:
    topics = []
    for item in retrieved:
        cat = item.get("category", "")
        if cat and cat not in topics:
            topics.append(cat)
    return topics[:5]


def build_initial_chat_message(
    persona: str,
    risk_level: str,
    main_risk_factors: list[str],
    actionable_recommendations: list[dict],
) -> str:
    """
    사용자의 최근 설문 결과를 바탕으로 AI 챗봇의 초기 대화 메시지를 생성합니다.
    """
    factors_str = ", ".join(main_risk_factors) if main_risk_factors else "특별한 위험 요인 없음"

    # Craft a personalized opening
    opening = f"안녕하세요, {persona}님! 최근 설문 결과를 보니 '{risk_level}' 수준으로 나타났고, 주요 위험 요인으로는 '{factors_str}' 등이 있으시네요."

    if actionable_recommendations:
        rec_titles = [rec['title'] for rec in actionable_recommendations[:2]] # Take top 2 recommendations
        recommendation_part = f" 특히 '{rec_titles[0]}'와 같은 활동을 추천해 드렸는데, 혹시 이와 관련해서 궁금한 점이 있으신가요?"
    else:
        recommendation_part = " 혹시 건강 관리에 대해 궁금한 점이나 도움이 필요하신가요?"

    return f"{opening}{recommendation_part} {SAFETY_NOTICE}"
