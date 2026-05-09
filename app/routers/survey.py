from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.jwt import decode_access_token
from app.schemas.survey import DementiaSurveySubmitRequest, DementiaSurveySubmitResponse
from app.services import survey as survey_service

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


@router.post("/dementia-risk", response_model=DementiaSurveySubmitResponse)
async def submit_dementia_risk_survey(
    body: DementiaSurveySubmitRequest,
    user_id: str = Depends(get_current_user_id),
) -> DementiaSurveySubmitResponse:
    return await survey_service.save_dementia_risk_survey(user_id=user_id, req=body)
