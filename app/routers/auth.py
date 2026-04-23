from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pymongo.errors import DuplicateKeyError

from app.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
)
from app.schemas.auth import AuthSessionResponse, LoginBody, RefreshBody, RegisterBody
from app.schemas.user import UserProfile
from app.services import refresh_tokens as refresh_tokens_service
from app.services import users as users_service

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)


def _user_to_out(doc: dict) -> UserProfile:
    return UserProfile(
        id=str(doc["_id"]),
        email=doc["email"],
        name=doc.get("name"),
    )


@router.post("/signup", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def signup(body: RegisterBody) -> UserProfile:
    if await users_service.get_user_by_email(body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    try:
        doc = await users_service.create_user(
            body.email, body.password, name=body.name
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from None
    return _user_to_out(doc)


@router.post("/login", response_model=AuthSessionResponse)
async def login(body: LoginBody) -> AuthSessionResponse:
    doc = await users_service.get_user_by_email(body.email)
    password_hash = (doc or {}).get("password_hash")
    if doc is None or not isinstance(password_hash, str) or not users_service.verify_password(
        body.password, password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    user_id = str(doc["_id"])
    access_token = create_access_token(subject=user_id)
    refresh_token, jti = create_refresh_token(subject=user_id)
    await refresh_tokens_service.store_refresh_token(
        user_id=user_id,
        jti=jti,
        expires_at=refresh_tokens_service.refresh_expires_at_from_now(),
    )
    return AuthSessionResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        user=_user_to_out(doc),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(body: RefreshBody) -> None:
    try:
        user_id, jti = decode_refresh_token(body.refreshToken)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        ) from None

    await refresh_tokens_service.revoke_refresh_token(user_id=user_id, jti=jti)
    return None


@router.post("/refresh", response_model=AuthSessionResponse)
async def refresh(body: RefreshBody) -> AuthSessionResponse:
    try:
        user_id, jti = decode_refresh_token(body.refreshToken)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        ) from None

    if not await refresh_tokens_service.is_refresh_token_active(user_id=user_id, jti=jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
        
    await refresh_tokens_service.revoke_refresh_token(user_id=user_id, jti=jti)

    access_token = create_access_token(subject=user_id)
    new_refresh_token, new_jti = create_refresh_token(subject=user_id)
    await refresh_tokens_service.store_refresh_token(
        user_id=user_id,
        jti=new_jti,
        expires_at=refresh_tokens_service.refresh_expires_at_from_now(),
    )

    doc = await users_service.get_user_by_id(user_id)
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    return AuthSessionResponse(
        accessToken=access_token,
        refreshToken=new_refresh_token,
        user=_user_to_out(doc),
    )


@router.get("/me", response_model=UserProfile)
async def me(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserProfile:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        user_id = decode_access_token(credentials.credentials)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        ) from None

    doc = await users_service.get_user_by_id(user_id)
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return _user_to_out(doc)
