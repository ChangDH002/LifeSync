from __future__ import annotations

PERSONA_MAP = {
    "운동 부족형": ["운동 부족"],
    "인지활동 부족형": ["인지활동 부족"],
    "사회적 고립형": ["사회활동 부족", "대화 부족"],
    "생활습관 불균형형": ["수면 부족", "식습관 불균형", "스트레스 높음"],
}

_KEYWORD_PERSONA: dict[str, str] = {}
for _persona, _keywords in PERSONA_MAP.items():
    for _kw in _keywords:
        _KEYWORD_PERSONA[_kw] = _persona

# 설문 요약 텍스트에서 더 넓게 매칭하기 위한 단어 단위 키워드
_PARTIAL_KEYWORDS: dict[str, str] = {
    "운동": "운동 부족형",
    "인지활동": "인지활동 부족형",
    "인지 활동": "인지활동 부족형",
    "사회활동": "사회적 고립형",
    "사회 활동": "사회적 고립형",
    "대화": "사회적 고립형",
    "고립": "사회적 고립형",
    "수면": "생활습관 불균형형",
    "식습관": "생활습관 불균형형",
    "스트레스": "생활습관 불균형형",
}

DEFAULT_PERSONA = "생활습관 불균형형"


def determine_persona(
    main_risk_factors: list[str],
    survey_summary: str = "",
) -> str:
    for factor in main_risk_factors:
        factor_stripped = factor.strip()
        if factor_stripped in _KEYWORD_PERSONA:
            return _KEYWORD_PERSONA[factor_stripped]
        for keyword, persona in _KEYWORD_PERSONA.items():
            if keyword in factor_stripped:
                return persona

    if survey_summary:
        # 완전 키워드 매칭 우선
        for keyword, persona in _KEYWORD_PERSONA.items():
            if keyword in survey_summary:
                return persona
        # 부분 키워드 매칭
        for keyword, persona in _PARTIAL_KEYWORDS.items():
            if keyword in survey_summary:
                return persona

    return DEFAULT_PERSONA


def get_persona_description(persona: str) -> str:
    descriptions = {
        "운동 부족형": "신체 활동이 부족하여 뇌 혈류와 심혈관 건강에 영향을 받고 있습니다. 규칙적인 운동으로 뇌 건강을 지켜보세요.",
        "인지활동 부족형": "두뇌를 자극하는 활동이 부족한 상태입니다. 다양한 인지 훈련이 뇌 가소성을 높이는 데 도움이 됩니다.",
        "사회적 고립형": "사회적 교류와 대화가 부족한 상태입니다. 사람들과의 소통은 정서 건강과 인지 기능 모두에 중요합니다.",
        "생활습관 불균형형": "수면, 식습관, 스트레스 등 전반적인 생활 습관의 균형이 필요합니다. 규칙적인 일상이 뇌 건강의 기초입니다.",
    }
    return descriptions.get(persona, descriptions[DEFAULT_PERSONA])


def get_secondary_risk_factors(persona: str, main_risk_factors: list[str]) -> list[str]:
    all_factors = [
        "운동 부족", "인지활동 부족", "사회활동 부족", "대화 부족",
        "수면 부족", "식습관 불균형", "스트레스 높음",
    ]
    return [f for f in all_factors if f not in main_risk_factors][:3]
