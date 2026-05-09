"""
AI 기능 테스트
실행: set PYTHONPATH=. && pytest -q tests/test_ai_features.py
"""
import os
import sys

import pytest

# PYTHONPATH 설정이 없어도 동작하도록
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

DATASET_PATH = "app/data/dementia_question_dataset_7000.csv"
SAFETY_NOTICE = "본 서비스는 의료적 진단을 제공하지 않습니다."


# ── 1. 페르소나 결정 ─────────────────────────────────────────────

def test_persona_cognitive_deficit():
    from app.services.persona_service import determine_persona
    persona = determine_persona(["인지활동 부족"])
    assert persona == "인지활동 부족형"


def test_persona_exercise_deficit():
    from app.services.persona_service import determine_persona
    persona = determine_persona(["운동 부족"])
    assert persona == "운동 부족형"


def test_persona_social_isolation():
    from app.services.persona_service import determine_persona
    persona = determine_persona(["사회활동 부족"])
    assert persona == "사회적 고립형"


def test_persona_conversation_deficit():
    from app.services.persona_service import determine_persona
    persona = determine_persona(["대화 부족"])
    assert persona == "사회적 고립형"


def test_persona_lifestyle_imbalance():
    from app.services.persona_service import determine_persona
    persona = determine_persona(["수면 부족"])
    assert persona == "생활습관 불균형형"


def test_persona_default_when_unknown():
    from app.services.persona_service import determine_persona
    persona = determine_persona(["알 수 없는 요인"])
    assert persona == "생활습관 불균형형"


def test_persona_priority_first_factor():
    from app.services.persona_service import determine_persona
    persona = determine_persona(["운동 부족", "인지활동 부족"])
    assert persona == "운동 부족형"


def test_persona_survey_summary_fallback():
    from app.services.persona_service import determine_persona
    persona = determine_persona([], survey_summary="인지활동이 부족한 상태입니다")
    assert persona == "인지활동 부족형"


# ── 2. 추천 배열 비어있지 않음 ────────────────────────────────────

def test_recommendations_not_empty():
    from app.services.recommendation_service import get_recommendations
    for persona in ["운동 부족형", "인지활동 부족형", "사회적 고립형", "생활습관 불균형형"]:
        recs = get_recommendations(persona)
        assert recs.get("dailyRoutines"), f"{persona}: dailyRoutines 비어있음"
        assert recs.get("cognitiveTrainings"), f"{persona}: cognitiveTrainings 비어있음"
        assert recs.get("lifestyleTips"), f"{persona}: lifestyleTips 비어있음"


def test_daily_routines_not_empty():
    from app.services.recommendation_service import get_daily_routines
    for persona in ["운동 부족형", "인지활동 부족형", "사회적 고립형", "생활습관 불균형형"]:
        routines = get_daily_routines(persona)
        assert len(routines) > 0, f"{persona}: dailyRoutines 비어있음"


def test_cognitive_trainings_not_empty():
    from app.services.recommendation_service import get_cognitive_trainings
    for persona in ["운동 부족형", "인지활동 부족형", "사회적 고립형", "생활습관 불균형형"]:
        trainings = get_cognitive_trainings(persona)
        assert len(trainings) > 0, f"{persona}: cognitiveTrainings 비어있음"


# ── 3. 데이터셋 7001줄 검증 ──────────────────────────────────────

def test_dataset_exists():
    assert os.path.exists(DATASET_PATH), f"데이터셋 파일 없음: {DATASET_PATH}"


def test_dataset_line_count():
    if not os.path.exists(DATASET_PATH):
        pytest.skip("데이터셋 파일 없음 — generate_dementia_dataset.py 먼저 실행")
    with open(DATASET_PATH, encoding="utf-8") as f:
        lines = sum(1 for _ in f)
    assert lines == 7001, f"줄 수 오류: {lines} (기대: 7001)"


def test_dataset_columns():
    if not os.path.exists(DATASET_PATH):
        pytest.skip("데이터셋 파일 없음")
    import csv
    with open(DATASET_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        expected = {"id", "category", "question", "canonical_question", "answer", "tags", "persona", "risk_factor", "intent"}
        assert expected == set(reader.fieldnames), f"컬럼 불일치: {reader.fieldnames}"


def test_dataset_row_count_via_service():
    if not os.path.exists(DATASET_PATH):
        pytest.skip("데이터셋 파일 없음")
    try:
        import pandas  # noqa: F401
    except ImportError:
        pytest.skip("pandas 미설치 — pip install pandas 후 재실행")
    from app.services import sbert_retriever
    sbert_retriever._dataset = None  # 캐시 초기화
    count = sbert_retriever.get_dataset_row_count()
    assert count == 7000, f"데이터 행 수 오류: {count}"


# ── 4. Gemini Key 없어도 fallback 응답 ───────────────────────────

def test_gemini_fallback_when_no_key(monkeypatch):
    from app.services import gemini_service
    monkeypatch.setattr("app.services.gemini_service._gemini_available", False)
    monkeypatch.setattr("app.services.gemini_service._gemini_client", None)

    text, fallback_used = gemini_service.generate("운동에 대해 알려주세요")
    assert fallback_used is True
    assert len(text) > 0
    assert SAFETY_NOTICE in text


def test_gemini_fallback_response_contains_safety_notice():
    from app.services.gemini_service import _fallback_response
    result = _fallback_response("수면에 대해 알려주세요")
    assert SAFETY_NOTICE in result


def test_gemini_fallback_has_content():
    from app.services.gemini_service import _fallback_response
    for keyword in ["운동", "수면", "식습관", "인지", "사회", "기타"]:
        result = _fallback_response(keyword)
        assert len(result) > 10


# ── 5. safetyNotice 포함 ─────────────────────────────────────────

def test_persona_service_safety_notice():
    from app.services.gemini_service import SAFETY_NOTICE as SN
    assert SN == "본 서비스는 의료적 진단을 제공하지 않습니다."


def test_fallback_response_safety_notice_all_categories():
    from app.services.gemini_service import _fallback_response
    test_cases = ["운동 부족", "수면 부족", "식습관", "인지훈련", "사회활동", "스트레스"]
    for case in test_cases:
        result = _fallback_response(case)
        assert SAFETY_NOTICE in result, f"'{case}'에 대한 응답에 safetyNotice 없음"


def test_faq_seed_safety_notice():
    import json
    with open("app/data/dementia_faq_seed.json", encoding="utf-8") as f:
        seed = json.load(f)
    for item in seed:
        assert SAFETY_NOTICE in item["answer"], f"FAQ seed id={item.get('id')}에 safetyNotice 없음"


# ── 6. SBERT 실패 시 keyword fallback ────────────────────────────

def test_keyword_fallback_when_sbert_unavailable(monkeypatch):
    if not os.path.exists(DATASET_PATH):
        pytest.skip("데이터셋 파일 없음")
    try:
        import pandas  # noqa: F401
    except ImportError:
        pytest.skip("pandas 미설치")
    from app.services import sbert_retriever
    monkeypatch.setattr(sbert_retriever, "_sbert_available", False)
    sbert_retriever._dataset = None  # 캐시 초기화

    results = sbert_retriever.retrieve_context("운동 방법 알려주세요", top_k=3)
    assert isinstance(results, list)


def test_keyword_retrieve_returns_list():
    if not os.path.exists(DATASET_PATH):
        pytest.skip("데이터셋 파일 없음")
    try:
        import pandas  # noqa: F401
    except ImportError:
        pytest.skip("pandas 미설치")
    from app.services import sbert_retriever
    sbert_retriever._dataset = None

    results = sbert_retriever.keyword_retrieve("수면과 뇌 건강", top_k=3)
    assert isinstance(results, list)
    if results:
        assert "question" in results[0]
        assert "answer" in results[0]


def test_seed_fallback_when_no_dataset(monkeypatch):
    from app.services import sbert_retriever
    monkeypatch.setattr(sbert_retriever, "_dataset", None)
    monkeypatch.setattr(sbert_retriever, "_sbert_available", False)

    # 강제로 빈 데이터셋으로 keyword_retrieve 우회 → _seed_fallback 호출
    results = sbert_retriever._seed_fallback("운동", top_k=3)
    assert isinstance(results, list)
    # seed 파일이 있으면 결과 있어야 함
    if os.path.exists("app/data/dementia_faq_seed.json"):
        assert len(results) > 0


# ── 7. SBERT 가용성 체크 ─────────────────────────────────────────

def test_is_sbert_available_returns_bool():
    from app.services.sbert_retriever import is_sbert_available
    result = is_sbert_available()
    assert isinstance(result, bool)


# ── 8. prompt_builder 동작 ───────────────────────────────────────

def test_build_chat_prompt_contains_safety():
    from app.services.prompt_builder import build_chat_prompt
    prompt = build_chat_prompt(
        message="걷기 운동을 해야 하나요?",
        persona="운동 부족형",
        risk_level="중간",
        main_risk_factors=["운동 부족"],
        recommendations=["하루 30분 걷기"],
    )
    assert "운동 부족형" in prompt
    assert "걷기 운동을 해야 하나요?" in prompt
    assert SAFETY_NOTICE in prompt


def test_build_context_string():
    from app.services.prompt_builder import build_context_string
    retrieved = [
        {"question": "Q1", "answer": "A1", "category": "운동", "score": 0.9},
        {"question": "Q2", "answer": "A2", "category": "수면", "score": 0.8},
    ]
    ctx = build_context_string(retrieved)
    assert "Q1" in ctx
    assert "A1" in ctx


def test_extract_related_topics():
    from app.services.prompt_builder import extract_related_topics
    retrieved = [
        {"question": "Q1", "answer": "A1", "category": "운동", "score": 0.9},
        {"question": "Q2", "answer": "A2", "category": "수면", "score": 0.8},
        {"question": "Q3", "answer": "A3", "category": "운동", "score": 0.7},
    ]
    topics = extract_related_topics(retrieved)
    assert "운동" in topics
    assert "수면" in topics
    assert len(topics) == 2  # 중복 제거
