from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.jwt import decode_access_token
from app.schemas.routines import (
    RoutineCompletionActionResponse,
    RoutineWeeklyHistoryResponse,
    TodayRoutinesResponse,
)
from app.services import routines as routines_service

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


@router.get("/today", response_model=TodayRoutinesResponse)
async def get_today_routines(
    user_id: str = Depends(get_current_user_id),
) -> TodayRoutinesResponse:
    return await routines_service.get_today_routines(user_id)


@router.get("/weekly", response_model=RoutineWeeklyHistoryResponse)
async def get_weekly_routine_history(
    user_id: str = Depends(get_current_user_id),
) -> RoutineWeeklyHistoryResponse:
    return await routines_service.get_weekly_routine_history(user_id)


@router.post(
    "/{routine_id}/complete",
    response_model=RoutineCompletionActionResponse,
)
async def complete_routine(
    routine_id: str,
    user_id: str = Depends(get_current_user_id),
) -> RoutineCompletionActionResponse:
    return await routines_service.complete_routine(user_id, routine_id)


@router.delete(
    "/{routine_id}/complete",
    response_model=RoutineCompletionActionResponse,
)
async def cancel_routine_completion(
    routine_id: str,
    user_id: str = Depends(get_current_user_id),
) -> RoutineCompletionActionResponse:
    return await routines_service.cancel_routine_completion(user_id, routine_id)
