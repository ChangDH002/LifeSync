from fastapi import APIRouter, HTTPException, Query, Request, status

from app.core.jwt import create_access_token, create_refresh_token
from app.schemas.auth import AuthSessionResponse
from app.schemas.social_auth import SocialCallbackBody, SocialStartResponse
from app.schemas.user import UserProfile
from app.services import refresh_tokens as refresh_tokens_service
from app.services import social_auth as social_auth_service
from app.services import users as users_service

router = APIRouter()

def _user_to_out(doc: dict) -> UserProfile:
    return UserProfile(
        id=str(doc["_id"]),
        email=doc["email"],
        name=doc.get("name"),
    )


@router.get("/google/start", response_model=SocialStartResponse)
async def google_start(
    mode: str = Query(..., pattern="^(login|signup)$"),
    redirectUri: str = Query(...),
) -> SocialStartResponse:
    try:
        url, state = social_auth_service.build_google_auth_url(
            mode=mode, redirect_uri=redirectUri
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None
    return SocialStartResponse(url=url, state=state)


@router.get("/kakao/start", response_model=SocialStartResponse)
async def kakao_start(
    mode: str = Query(..., pattern="^(login|signup)$"),
    redirectUri: str = Query(...),
) -> SocialStartResponse:
    try:
        url, state = social_auth_service.build_kakao_auth_url(
            mode=mode, redirect_uri=redirectUri
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None
    return SocialStartResponse(url=url, state=state)


@router.post("/google/callback", response_model=AuthSessionResponse)
async def google_callback(body: SocialCallbackBody) -> AuthSessionResponse:
    try:
        state_payload = social_auth_service.decode_state(body.state or "")
        if state_payload.get("p") != "google":
            raise ValueError("Invalid state provider")
        if state_payload.get("r") != body.redirectUri:
            raise ValueError("redirectUri mismatch")

        email, name, provider_user_id = await social_auth_service.exchange_google_code(
            code=body.code, redirect_uri=body.redirectUri
        )
        user_doc = await social_auth_service.resolve_user_by_social(
            email=email,
            provider="google",
            provider_user_id=provider_user_id,
            name=name,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None

    user_id = str(user_doc["_id"])
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
        user=_user_to_out(user_doc),
    )


@router.post("/kakao/callback", response_model=AuthSessionResponse)
async def kakao_callback(body: SocialCallbackBody) -> AuthSessionResponse:
    try:
        state_payload = social_auth_service.decode_state(body.state or "")
        if state_payload.get("p") != "kakao":
            raise ValueError("Invalid state provider")
        if state_payload.get("r") != body.redirectUri:
            raise ValueError("redirectUri mismatch")

        email, name, provider_user_id = await social_auth_service.exchange_kakao_code(
            code=body.code, redirect_uri=body.redirectUri
        )
        user_doc = await social_auth_service.resolve_user_by_social(
            email=email,
            provider="kakao",
            provider_user_id=provider_user_id,
            name=name,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None

    user_id = str(user_doc["_id"])
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
        user=_user_to_out(user_doc),
    )


@router.get("/google/redirect", response_model=AuthSessionResponse)
async def google_redirect(
    request: Request,
    code: str = Query(...),
    state: str = Query(...),
) -> AuthSessionResponse:
    redirect_uri = str(request.url.replace(query=None))
    try:
        state_payload = social_auth_service.decode_state(state)
        if state_payload.get("p") != "google":
            raise ValueError("Invalid state provider")
        if state_payload.get("r") != redirect_uri:
            raise ValueError("redirectUri mismatch")

        email, name, provider_user_id = await social_auth_service.exchange_google_code(
            code=code, redirect_uri=redirect_uri
        )
        user_doc = await social_auth_service.resolve_user_by_social(
            email=email,
            provider="google",
            provider_user_id=provider_user_id,
            name=name,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None

    user_id = str(user_doc["_id"])
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
        user=_user_to_out(user_doc),
    )


@router.get("/kakao/redirect", response_model=AuthSessionResponse)
async def kakao_redirect(
    request: Request,
    code: str = Query(...),
    state: str = Query(...),
) -> AuthSessionResponse:
    redirect_uri = str(request.url.replace(query=None))
    try:
        state_payload = social_auth_service.decode_state(state)
        if state_payload.get("p") != "kakao":
            raise ValueError("Invalid state provider")
        if state_payload.get("r") != redirect_uri:
            raise ValueError("redirectUri mismatch")

        email, name, provider_user_id = await social_auth_service.exchange_kakao_code(
            code=code, redirect_uri=redirect_uri
        )
        user_doc = await social_auth_service.resolve_user_by_social(
            email=email,
            provider="kakao",
            provider_user_id=provider_user_id,
            name=name,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None

    user_id = str(user_doc["_id"])
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
        user=_user_to_out(user_doc),
    )

