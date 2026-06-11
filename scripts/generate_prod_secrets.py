from __future__ import annotations

import secrets


def make_secret(length: int = 48) -> str:
    # token_urlsafe returns a slightly longer string than the requested bytes.
    return secrets.token_urlsafe(length)


def main() -> None:
    print("SECRET_KEY=" + make_secret())
    print("JWT_SECRET_KEY=" + make_secret())
    print("SOCIAL_STATE_SECRET=" + make_secret())


if __name__ == "__main__":
    main()
