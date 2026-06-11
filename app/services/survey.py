from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status

from app.db import get_db
from app.schemas.survey import (
    DementiaSurveyResultDocument,
    DementiaSurveySubmitRequest,
    DementiaSurveySubmitResponse,
)
from app.services import routine_recommendation as routine_recommendation_service
from app.services.dementia_risk_scoring import (
    calculate_anu_adri_raw,
    calculate_cogdrisk_raw,
    calculate_final_risk_score,
    calculate_risk_level,
    normalize_responses,
)
from app.services.persona_service import ( # New import
    determine_persona,
)

SURVEY_TYPE = "dementia-risk"
DEFAULT_SURVEY_VERSION = "dementia-risk-v1"
SCORING_VERSION = "cogdrisk-anuadri-v1"
SUBMISSION_POLICY = "append_history"
MIN_RESPONSE_COUNT = 5
REQUIRED_RESPONSE_FIELDS = {"age", "sex"}

FACTOR_CATEGORY_MAP: dict[str, str] = {
    "age": "인구통계",
    "sex": "인구통계",
    "education_level": "인구통계",
    "bmi": "심혈관·대사",
    "high_cholesterol": "심혈관·대사",
    "has_diabetes": "심혈관·대사",
    "has_stroke": "심혈관·대사",
    "has_hypertension": "심혈관·대사",
    "has_atrial_fib": "심혈관·대사",
    "depression": "심리·신경",
    "has_tbi": "심리·신경",
    "loneliness": "심리·신경",
    "social_engagement": "심리·신경",
    "insomnia": "심리·신경",
    "cognitive_activity": "생활습관",
    "physical_activity": "생활습관",
    "fish_intake": "생활습관",
    "smoking_status": "생활습관",
    "pesticide_exposure": "생활습관",
    "alcohol_intake": "생활습관",
}


def _build_category_scores(
    cogdrisk_factors: dict[str, float],
    anu_adri_factors: dict[str, float],
) -> dict[str, float]:
    category_scores = {
        "인구통계": 0.0,
        "심혈관·대사": 0.0,
        "심리·신경": 0.0,
        "생활습관": 0.0,
    }
    summed_factors: dict[str, float] = {}

    for factors in (cogdrisk_factors, anu_adri_factors):
        for factor, score in factors.items():
            summed_factors[factor] = summed_factors.get(factor, 0.0) + score

    for factor, score in summed_factors.items():
        category = FACTOR_CATEGORY_MAP.get(factor)
        if category:
            category_scores[category] += score

    return {category: round(score, 1) for category, score in category_scores.items()}


def _client_score_delta(
    client_total_score: float | None,
    server_total_score: float,
) -> float | None:
    if client_total_score is None:
        return None
    return round(client_total_score - server_total_score, 1)


def _build_client_submitted(req: DementiaSurveySubmitRequest) -> dict[str, Any]:
    return {
        "total_score": req.totalScore,
        "risk_level": req.riskLevel,
        "category_scores": req.categoryScores,
    }


def _validate_submission(
    req: DementiaSurveySubmitRequest,
    submitted_responses: dict[str, Any],
    normalized_responses: dict[str, Any],
) -> None:
    if req.surveyType != SURVEY_TYPE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="지원하지 않는 설문 유형입니다.",
        )

    if len(normalized_responses) < MIN_RESPONSE_COUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="설문 응답 수가 부족합니다.",
        )

    missing_required = REQUIRED_RESPONSE_FIELDS - set(submitted_responses)
    if missing_required:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"필수 설문 응답이 누락되었습니다: {', '.join(sorted(missing_required))}",
        )


def build_dementia_risk_survey_document(
    user_id: str,
    req: DementiaSurveySubmitRequest,
    submitted_at: datetime,
) -> DementiaSurveyResultDocument:
    raw_responses = req.raw_responses()
    submitted_responses = req.normalized_responses()
    normalized_responses = normalize_responses(submitted_responses)
    _validate_submission(req, submitted_responses, normalized_responses)

    cogdrisk = calculate_cogdrisk_raw(normalized_responses)
    anu_adri = calculate_anu_adri_raw(normalized_responses)
    final_risk_score = calculate_final_risk_score(
        cogdrisk.normalizedScore, anu_adri.normalizedScore
    )
    risk_level = calculate_risk_level(final_risk_score)
    category_scores = _build_category_scores(
        cogdrisk.matchedFactors,
        anu_adri.matchedFactors,
    )
    score_delta = _client_score_delta(req.totalScore, final_risk_score)
    ignored_fields = sorted(set(submitted_responses) - set(FACTOR_CATEGORY_MAP))

    # Determine persona and main risk factors based on the survey results
    # For simplicity, main_risk_factors are derived from matched factors
    derived_main_risk_factors = list(set(cogdrisk.matchedFactors.keys()) | set(anu_adri.matchedFactors.keys()))
    
    # Construct a simple survey summary from raw responses for persona determination
    simple_survey_summary = ", ".join([f"{k}: {v}" for k, v in raw_responses.items()])
    
    derived_persona = determine_persona(
        main_risk_factors=derived_main_risk_factors,
        survey_summary=simple_survey_summary,
    )

    return DementiaSurveyResultDocument(
        user_id=user_id,
        survey_type=req.surveyType,
        survey_version=req.surveyVersion or DEFAULT_SURVEY_VERSION,
        scoring_version=SCORING_VERSION,
        client_version=req.clientVersion,
        total_score=final_risk_score,
        risk_level=risk_level,
        final_risk_score=final_risk_score,
        category_scores=category_scores,
        responses=raw_responses,
        normalized_responses=normalized_responses,
        ignored_fields=ignored_fields,
        client_submitted=_build_client_submitted(req),
        score_mismatch=score_delta is not None and abs(score_delta) > 0.1,
        score_delta=score_delta,
        submission_policy=SUBMISSION_POLICY,
        cogdrisk={
            "raw_score": cogdrisk.rawScore,
            "normalized_score": cogdrisk.normalizedScore,
            "matched_factors": cogdrisk.matchedFactors,
        },
        persona=derived_persona, # New field
        main_risk_factors=derived_main_risk_factors, # New field
        anu_adri={
            "raw_score": anu_adri.rawScore,
            "normalized_score": anu_adri.normalizedScore,
            "matched_factors": anu_adri.matchedFactors,
        },
        response_count=len(normalized_responses),
        submitted_at=submitted_at,
        created_at=submitted_at,
    )


def _response_from_document(
    doc: DementiaSurveyResultDocument, survey_id: str
) -> DementiaSurveySubmitResponse:
    return DementiaSurveySubmitResponse(
        surveyId=survey_id,
        surveyType=doc.survey_type,
        surveyVersion=doc.survey_version,
        scoringVersion=doc.scoring_version,
        totalScore=doc.total_score,
        riskLevel=doc.risk_level,
        finalRiskScore=doc.final_risk_score,
        categoryScores=doc.category_scores,
        mainRiskFactors=doc.main_risk_factors,
        responseCount=doc.response_count,
        cogdrisk={
            "rawScore": doc.cogdrisk.raw_score,
            "normalizedScore": doc.cogdrisk.normalized_score,
            "matchedFactors": doc.cogdrisk.matched_factors,
        },
        anuAdri={
            "rawScore": doc.anu_adri.raw_score,
            "normalizedScore": doc.anu_adri.normalized_score,
            "matchedFactors": doc.anu_adri.matched_factors,
        },
        submittedAt=doc.submitted_at,
    )


async def save_dementia_risk_survey(
    user_id: str, req: DementiaSurveySubmitRequest
) -> DementiaSurveySubmitResponse:
    now = datetime.now(timezone.utc)
    db = get_db()
    doc = build_dementia_risk_survey_document(user_id=user_id, req=req, submitted_at=now)

    result = await db.survey_results.insert_one(doc.model_dump())
    await routine_recommendation_service.assign_user_routines_from_survey(user_id, doc)

    return _response_from_document(doc, survey_id=str(result.inserted_id))


def _survey_document_from_mongo(raw: dict[str, Any]) -> DementiaSurveyResultDocument:
    raw_without_id = {key: value for key, value in raw.items() if key != "_id"}
    return DementiaSurveyResultDocument.model_validate(raw_without_id)


async def get_latest_dementia_risk_survey(
    user_id: str,
) -> DementiaSurveyResultDocument | None:
    db = get_db()
    raw = await db.survey_results.find_one(
        {"user_id": user_id, "survey_type": "dementia-risk"},
        sort=[("submitted_at", -1)],
    )
    if raw is None:
        return None
    return _survey_document_from_mongo(raw)
