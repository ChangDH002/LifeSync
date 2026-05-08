from __future__ import annotations

from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from jose import JWTError, jwt
from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.services import users as users_service


def _validate_redirect_uri(redirect_uri: str) -> None:
    allowlist = settings.social_redirect_allowlist_list
    if redirect_uri not in allowlist:
        raise ValueError("redirectUri is not allowed")


def create_state(*, provider: str, mode: str, redirect_uri: str) -> str:
    if mode not in {"login", "signup"}:
        raise ValueError("Invalid mode")
    _validate_redirect_uri(redirect_uri)

    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.social_state_expires_minutes)
    payload = {"p": provider, "m": mode, "r": redirect_uri, "exp": exp}
    return jwt.encode(payload, settings.social_state_secret, algorithm="HS256")


def decode_state(state: str) -> dict:
    try:
        payload = jwt.decode(state, settings.social_state_secret, algorithms=["HS256"])
    except JWTError as e:
        raise ValueError("Invalid state") from e
    return payload


def build_google_auth_url(*, mode: str, redirect_uri: str) -> tuple[str, str]:
    if not settings.google_client_id:
        raise ValueError("Google OAuth is not configured")
    state = create_state(provider="google", mode=mode, redirect_uri=redirect_uri)
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
    }
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    return url, state


async def exchange_google_code(*, code: str, redirect_uri: str) -> tuple[str, str | None, str]:
    if not settings.google_client_id or not settings.google_client_secret:
        raise ValueError("Google OAuth is not configured")

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            token_resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            token_resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            detail = e.response.text[:500] if e.response is not None else str(e)
            raise ValueError(f"Google token exchange failed: {detail}") from None
        except httpx.RequestError as e:
            raise ValueError(f"Google token request failed: {e.__class__.__name__}") from None

        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not isinstance(access_token, str) or not access_token:
            raise ValueError("Google token exchange failed")

        try:
            userinfo_resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            userinfo_resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            detail = e.response.text[:500] if e.response is not None else str(e)
            raise ValueError(f"Google userinfo fetch failed: {detail}") from None
        except httpx.RequestError as e:
            raise ValueError(f"Google userinfo request failed: {e.__class__.__name__}") from None

        userinfo = userinfo_resp.json()

    email = userinfo.get("email")
    name = userinfo.get("name") or userinfo.get("given_name")
    provider_user_id = userinfo.get("sub")
    if not isinstance(email, str) or not email:
        raise ValueError("Google account has no email")
    if not isinstance(provider_user_id, str) or not provider_user_id:
        raise ValueError("Google account id missing")
    return email, name if isinstance(name, str) else None, provider_user_id


def build_kakao_auth_url(*, mode: str, redirect_uri: str) -> tuple[str, str]:
    if not settings.kakao_rest_api_key:
        raise ValueError("Kakao OAuth is not configured")
    kakao_key = settings.kakao_rest_api_key.strip()
    state = create_state(provider="kakao", mode=mode, redirect_uri=redirect_uri)
    params = {
        "client_id": kakao_key,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "state": state,
    }
    url = "https://kauth.kakao.com/oauth/authorize?" + urlencode(params)
    return url, state


async def exchange_kakao_code(*, code: str, redirect_uri: str) -> tuple[str, str | None, str]:
    if not settings.kakao_rest_api_key:
        raise ValueError("Kakao OAuth is not configured")

    kakao_key = settings.kakao_rest_api_key.strip()
    data = {
        "grant_type": "authorization_code",
        "client_id": kakao_key,
        "redirect_uri": redirect_uri,
        "code": code,
    }
    if settings.kakao_client_secret:
        data["client_secret"] = settings.kakao_client_secret.strip()

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            token_resp = await client.post(
                "https://kauth.kakao.com/oauth/token",
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            token_resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            detail = e.response.text[:500] if e.response is not None else str(e)
            raise ValueError(f"Kakao token exchange failed: {detail}") from None
        except httpx.RequestError as e:
            raise ValueError(f"Kakao token request failed: {e.__class__.__name__}") from None

        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not isinstance(access_token, str) or not access_token:
            raise ValueError("Kakao token exchange failed")

        try:
            user_resp = await client.get(
                "https://kapi.kakao.com/v2/user/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user_resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            detail = e.response.text[:500] if e.response is not None else str(e)
            raise ValueError(f"Kakao userinfo fetch failed: {detail}") from None
        except httpx.RequestError as e:
            raise ValueError(f"Kakao userinfo request failed: {e.__class__.__name__}") from None

        userinfo = user_resp.json()

    provider_user_id = str(userinfo.get("id") or "")
    kakao_account = userinfo.get("kakao_account") or {}
    profile = kakao_account.get("profile") or {}
    email = kakao_account.get("email")
    name = profile.get("nickname")

    if not isinstance(email, str) or not email:
        raise ValueError("Kakao account has no email")
    if not provider_user_id:
        raise ValueError("Kakao account id missing")
    return email, name if isinstance(name, str) else None, provider_user_id


async def resolve_user_by_social(
    *,
    email: str,
    provider: str,
    provider_user_id: str,
    name: str | None,
) -> dict:
    existing = await users_service.get_user_by_email(email)
    if existing is None:
        try:
            return await users_service.create_social_user(
                email=email,
                name=name,
                provider=provider,
                provider_user_id=provider_user_id,
            )
        except DuplicateKeyError:
            # Race condition: user created concurrently
            existing = await users_service.get_user_by_email(email)
            if existing is None:
                raise ValueError("User creation conflict") from None

    await users_service.link_social_provider(
        user_id=str(existing["_id"]),
        provider=provider,
        provider_user_id=provider_user_id,
    )
    return existing

