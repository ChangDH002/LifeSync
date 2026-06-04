from datetime import datetime, timedelta, timezone
from uuid import uuid4

from jose import JWTError, jwt

from app.core.config import settings


def create_access_token(*, subject: str, expires_minutes: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.access_token_expires_minutes
    )
    payload = {"sub": subject, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except JWTError as e:
        raise ValueError("Invalid token") from e

    token_type = payload.get("type")
    if token_type != "access":
        raise ValueError("Invalid token type")

    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject:
        raise ValueError("Invalid token subject")
    return subject


def create_refresh_token(*, subject: str, expires_days: int | None = None) -> tuple[str, str]:
    jti = str(uuid4())
    expire = datetime.now(timezone.utc) + timedelta(
        days=expires_days or settings.refresh_token_expires_days
    )
    payload = {"sub": subject, "jti": jti, "exp": expire, "type": "refresh"}
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, jti


def decode_refresh_token(token: str) -> tuple[str, str]:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except JWTError as e:
        raise ValueError("Invalid token") from e

    token_type = payload.get("type")
    if token_type != "refresh":
        raise ValueError("Invalid token type")

    subject = payload.get("sub")
    jti = payload.get("jti")
    if not isinstance(subject, str) or not subject:
        raise ValueError("Invalid token subject")
    if not isinstance(jti, str) or not jti:
        raise ValueError("Invalid token jti")
    return subject, jti

