from fastapi import APIRouter, Depends
from app.schemas.avatar import AvatarSchema, WaterTreeResponse
from app.services import avatar as avatar_service
from app.core.dependencies import get_current_user_id

router = APIRouter()


@router.get("/me", response_model=AvatarSchema)
async def get_my_avatar(
    user_id: str = Depends(get_current_user_id),
) -> AvatarSchema:
    return await avatar_service.get_my_avatar(user_id)


@router.post("/water", response_model=WaterTreeResponse)
async def water_tree(
    user_id: str = Depends(get_current_user_id),
) -> WaterTreeResponse:
    return await avatar_service.water_tree(user_id)
