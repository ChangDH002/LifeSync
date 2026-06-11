from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.mypage import MypageSummaryResponse
from app.services import mypage as mypage_service
from app.services import users as users_service
from app.core.dependencies import get_current_user_id

router = APIRouter()

@router.get("/summary", response_model=MypageSummaryResponse)
async def get_mypage_summary(
    user_id: str = Depends(get_current_user_id),
) -> MypageSummaryResponse:
    user_doc = await users_service.get_user_by_id(user_id)
    if user_doc is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return await mypage_service.get_mypage_summary(user_id=user_id, user_doc=user_doc)
