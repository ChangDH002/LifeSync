from typing import TypedDict


class ActionableRecommendation(TypedDict):
    """사용자가 실천할 수 있는 구체적인 추천 항목의 구조"""

    title: str
    description: str
    action_link: str  # 예: '/training/memory', '/routine/walk-timer'
    category: str  # 예: '인지훈련', '신체활동', '수면관리'


# 위험 요인과 추천 과제를 연결하는 맵
RECOMMENDATION_MAP: dict[str, ActionableRecommendation] = {
    "cognitive_activity": {
        "title": "두뇌 스트레칭, 인지훈련 게임",
        "description": "새로운 것을 배우고 도전하는 것은 뇌를 건강하게 유지하는 가장 좋은 방법 중 하나입니다. 간단한 게임으로 시작해 보세요.",
        "action_link": "/training",
        "category": "인지훈련",
    },
    "physical_activity": {
        "title": "하루 30분, 가벼운 산책",
        "description": "규칙적인 걷기는 뇌 혈류를 개선하고 새로운 뇌세포 성장을 돕습니다. 산책 타이머와 함께 걸어볼까요?",
        "action_link": "/routine/walk",  # 향후 산책 타이머 기능 추가를 위한 경로
        "category": "신체활동",
    },
    "insomnia": {
        "title": "편안한 밤을 위한 수면 준비",
        "description": "질 좋은 수면은 낮 동안 쌓인 뇌의 노폐물을 청소해 줍니다. 수면 타이머로 규칙적인 습관을 만들어보세요.",
        "action_link": "/routine/sleep",  # 향후 수면 타이머 기능 추가를 위한 경로
        "category": "수면관리",
    },
    "social_engagement": {
        "title": "마음을 나누는 대화",
        "description": "가족, 친구와의 대화는 뇌를 자극하고 우울감을 줄여줍니다. 오늘 하루 있었던 일을 AI 코치와 이야기하며 연습해 보세요.",
        "action_link": "/chatbot",
        "category": "사회활동",
    },
    "loneliness": {
        "title": "AI 코치와 대화하기",
        "description": "외로움은 인지 건강에 영향을 줄 수 있습니다. AI 코치는 언제나 당신의 이야기를 들어줄 준비가 되어 있어요.",
        "action_link": "/chatbot",
        "category": "사회활동",
    },
    "depression": {
        "title": "기분 전환을 위한 작은 활동",
        "description": "햇볕을 쬐며 잠시 걷거나, 좋아하는 음악을 듣는 것만으로도 기분이 나아질 수 있습니다. 작은 성취를 만들어 보세요.",
        "action_link": "/routine/walk",
        "category": "정서관리",
    },
}

# 특정 위험 요인이 없을 경우 제공될 기본 추천 목록
DEFAULT_RECOMMENDATIONS: list[ActionableRecommendation] = [
    RECOMMENDATION_MAP["physical_activity"],
    RECOMMENDATION_MAP["cognitive_activity"],
    RECOMMENDATION_MAP["social_engagement"],
]


def get_recommendations_for_factors(
    main_risk_factors: list[str],
    limit: int = 3,
) -> list[ActionableRecommendation]:
    """주요 위험 요인에 따라 맞춤형 실천 권장 사항을 생성합니다."""
    recommendations: list[ActionableRecommendation] = []
    added_titles: set[str] = set()

    for factor in main_risk_factors:
        if factor in RECOMMENDATION_MAP and RECOMMENDATION_MAP[factor]["title"] not in added_titles:
            rec = RECOMMENDATION_MAP[factor]
            recommendations.append(rec)
            added_titles.add(rec["title"])

    # 매칭된 추천이 부족하면, 기본 추천으로 채웁니다.
    if len(recommendations) < limit:
        for default_rec in DEFAULT_RECOMMENDATIONS:
            if len(recommendations) >= limit:
                break
            if default_rec["title"] not in added_titles:
                recommendations.append(default_rec)
                added_titles.add(default_rec["title"])

    return recommendations[:limit]