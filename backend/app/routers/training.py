from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.jwt import decode_access_token
from app.schemas.training import TrainingParticipationRequest, TrainingParticipationResponse
from app.services import training as training_service

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    try:
        return decode_access_token(credentials.credentials)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        ) from None


@router.post("/participation", response_model=TrainingParticipationResponse, status_code=status.HTTP_200_OK)
async def record_participation(
    body: TrainingParticipationRequest,
    user_id: str = Depends(get_current_user_id),
) -> TrainingParticipationResponse:
    return await training_service.record_participation(user_id=user_id, req=body)
