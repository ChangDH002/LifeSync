from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.jwt import decode_access_token
from app.schemas.avatar import AvatarSchema, WaterTreeResponse
from app.services import avatar as avatar_service

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
