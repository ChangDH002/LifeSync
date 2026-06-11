from fastapi import APIRouter, Depends, status
from app.core.dependencies import get_current_user_id
from app.schemas.training import TrainingParticipationRequest, TrainingParticipationResponse
from app.services import training as training_service

router = APIRouter()

@router.post("/participation", response_model=TrainingParticipationResponse, status_code=status.HTTP_200_OK)
async def record_participation(
    body: TrainingParticipationRequest,
    user_id: str = Depends(get_current_user_id),
) -> TrainingParticipationResponse:
    return await training_service.record_participation(user_id=user_id, req=body)
