from datetime import datetime, timezone
from typing import Any

from app.db import get_db
from app.schemas.survey import DementiaSurveySubmitRequest, DementiaSurveySubmitResponse


async def save_dementia_risk_survey(
    user_id: str, req: DementiaSurveySubmitRequest
) -> DementiaSurveySubmitResponse:
    now = datetime.now(timezone.utc)
    db = get_db()

    doc = {
        "user_id": user_id,
        "survey_type": req.surveyType,
        "total_score": req.totalScore,
        "risk_level": req.riskLevel,
        "category_scores": req.categoryScores,
        "responses": [item.model_dump() for item in req.responses],
        "response_count": len(req.responses),
        "submitted_at": now,
        "created_at": now,
    }

    result = await db.survey_results.insert_one(doc)

    return DementiaSurveySubmitResponse(
        surveyId=str(result.inserted_id),
        surveyType=req.surveyType,
        totalScore=req.totalScore,
        riskLevel=req.riskLevel,
        submittedAt=now,
    )


async def get_latest_dementia_risk_survey(user_id: str) -> dict[str, Any] | None:
    db = get_db()
    return await db.survey_results.find_one(
        {"user_id": user_id, "survey_type": "dementia-risk"},
        sort=[("submitted_at", -1)],
    )
