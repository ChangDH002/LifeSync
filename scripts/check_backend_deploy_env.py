from __future__ import annotations

import os
import sys


REQUIRED_VARS = [
    "APP_ENV",
    "APP_NAME",
    "MONGODB_URL",
    "DATABASE_NAME",
    "CORS_ORIGINS",
    "SOCIAL_REDIRECT_ALLOWLIST",
    "SECRET_KEY",
    "JWT_SECRET_KEY",
    "SOCIAL_STATE_SECRET",
    "ACCESS_TOKEN_EXPIRES_MINUTES",
    "REFRESH_TOKEN_EXPIRES_DAYS",
    "AI_CHATBOT_URL",
]

OPTIONAL_VARS = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "KAKAO_REST_API_KEY",
    "KAKAO_CLIENT_SECRET",
]


def mask(value: str) -> str:
    if len(value) <= 10:
        return "*" * len(value)
    return value[:4] + "..." + value[-4:]


def main() -> int:
    missing = [name for name in REQUIRED_VARS if not os.getenv(name, "").strip()]

    print("Required variables")
    for name in REQUIRED_VARS:
        raw = os.getenv(name, "").strip()
        state = "MISSING" if not raw else mask(raw)
        print(f"- {name}: {state}")

    print("\nOptional variables")
    for name in OPTIONAL_VARS:
        raw = os.getenv(name, "").strip()
        state = "not set" if not raw else mask(raw)
        print(f"- {name}: {state}")

    if missing:
        print("\nMissing required variables:")
        for name in missing:
            print(f"- {name}")
        return 1

    print("\nAll required backend deploy variables are set.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
