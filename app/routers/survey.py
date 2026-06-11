from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user_id
from app.schemas.survey import DementiaSurveySubmitRequest, DementiaSurveySubmitResponse
from app.services import survey as survey_service

router = APIRouter()

@router.post("/dementia-risk", response_model=DementiaSurveySubmitResponse)
async def submit_dementia_risk_survey(
    body: DementiaSurveySubmitRequest,
    user_id: str = Depends(get_current_user_id),
) -> DementiaSurveySubmitResponse:
    return await survey_service.save_dementia_risk_survey(user_id=user_id, req=body)
