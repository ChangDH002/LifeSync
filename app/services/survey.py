from datetime import datetime, timezone
from typing import Any

from app.db import get_db
from app.schemas.survey import DementiaSurveySubmitRequest, DementiaSurveySubmitResponse
from app.services.dementia_risk_scoring import (
    calculate_anu_adri_raw,
    calculate_cogdrisk_raw,
    calculate_final_risk_score,
    calculate_risk_level,
    normalize_responses,
)


async def save_dementia_risk_survey(
    user_id: str, req: DementiaSurveySubmitRequest
) -> DementiaSurveySubmitResponse:
    now = datetime.now(timezone.utc)
    db = get_db()
    raw_responses = req.raw_responses()
    normalized_responses = normalize_responses(req.normalized_responses())
    cogdrisk = calculate_cogdrisk_raw(normalized_responses)
    anu_adri = calculate_anu_adri_raw(normalized_responses)
    final_risk_score = calculate_final_risk_score(
        cogdrisk.normalizedScore, anu_adri.normalizedScore
    )
    risk_level = calculate_risk_level(final_risk_score)

    doc = {
        "user_id": user_id,
        "survey_type": req.surveyType,
        "total_score": req.totalScore,
        "risk_level": risk_level,
        "final_risk_score": final_risk_score,
        "category_scores": req.categoryScores,
        "responses": raw_responses,
        "normalized_responses": normalized_responses,
        "cogdrisk": {
            "raw_score": cogdrisk.rawScore,
            "normalized_score": cogdrisk.normalizedScore,
            "matched_factors": cogdrisk.matchedFactors,
        },
        "anu_adri": {
            "raw_score": anu_adri.rawScore,
            "normalized_score": anu_adri.normalizedScore,
            "matched_factors": anu_adri.matchedFactors,
        },
        "response_count": req.response_count(),
        "submitted_at": now,
        "created_at": now,
    }

    result = await db.survey_results.insert_one(doc)

    return DementiaSurveySubmitResponse(
        surveyId=str(result.inserted_id),
        surveyType=req.surveyType,
        totalScore=req.totalScore,
        riskLevel=risk_level,
        finalRiskScore=final_risk_score,
        cogdrisk=cogdrisk,
        anuAdri=anu_adri,
        submittedAt=now,
    )


async def get_latest_dementia_risk_survey(user_id: str) -> dict[str, Any] | None:
    db = get_db()
    return await db.survey_results.find_one(
        {"user_id": user_id, "survey_type": "dementia-risk"},
        sort=[("submitted_at", -1)],
    )
