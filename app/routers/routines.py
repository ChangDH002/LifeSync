from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user_id
from app.schemas.routines import (
    RoutineCompletionActionResponse,
    RoutineWeeklyHistoryResponse,
    TodayRoutinesResponse,
)
from app.services import routines as routines_service
from app.services import routine_recommendation as recommendation_service

router = APIRouter()

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


@router.get("/recommendations", response_model=TodayRoutinesResponse)
async def get_routine_recommendations(
    user_id: str = Depends(get_current_user_id),
) -> TodayRoutinesResponse:
    """최신 설문 결과에 기반한 맞춤 루틴을 추천합니다."""
    return await recommendation_service.get_user_routine_recommendations(user_id)


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
