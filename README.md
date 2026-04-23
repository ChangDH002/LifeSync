# 프로젝트 구조 (Dementia API)

FastAPI + Motor(MongoDB) 기반 백엔드. 인증은 **Bearer JWT(access/refresh)** 기반이다.

## 디렉터리 구조

```
dementia/
├── .env                 # 로컬 전용 (Git 제외). .env.example 참고
├── .env.example         # 환경 변수 예시
├── .gitignore
├── requirements.txt
└── app/
    ├── __init__.py
    ├── main.py          # FastAPI 앱, 미들웨어, lifespan, 라우터 마운트
    ├── db.py            # Motor 클라이언트, 연결/종료, 인덱스 생성
    ├── core/
    │   ├── __init__.py
    │   ├── config.py    # pydantic-settings (.env 로드)
    │   ├── jwt.py       # access/refresh JWT 생성/검증
    │   └── password_hash.py  # 비밀번호 해시/검증(bcrypt)
    ├── routers/
    │   ├── __init__.py
    │   ├── auth.py      # /auth/* (signup/login/refresh/me 등)
    │   └── social_auth.py # /auth/social/* (google/kakao)
    ├── schemas/
    │   ├── __init__.py
    │   ├── auth.py      # RegisterBody, LoginBody, AuthSessionResponse 등
    │   ├── social_auth.py # 소셜 start/callback 스키마
    │   ├── user.py      # UserProfile/UserDB 등 사용자 스키마
    │   └── common.py    # 공통 메시지 응답 스키마(CommonResponse)
    └── services/
        ├── __init__.py
        ├── users.py     # 사용자 CRUD/소셜 연결
        ├── refresh_tokens.py # refresh token(jti) 저장/활성/폐기
        └── social_auth.py # provider OAuth URL/교환/유저 resolve
```

## 계층 역할

| 경로 | 역할 |
|------|------|
| `app/main.py` | 앱 생성, `lifespan`에서 DB 연결, `CORSMiddleware`, 라우터 마운트 |
| `app/core/config.py` | `MONGODB_URL`, `DATABASE_NAME`, `JWT_SECRET_KEY`, OAuth 키 등 설정 싱글톤 `settings` |
| `app/core/password_hash.py` | 비밀번호 bcrypt 해시/검증 유틸 |
| `app/db.py` | `AsyncIOMotorClient`, `get_db()`, 기동 시 `ping` 및 `users` 컬렉션 인덱스 |
| `app/core/jwt.py` | access/refresh JWT 발급/검증 |
| `app/schemas/auth.py` | 인증 요청/응답 스키마(`RegisterBody`, `LoginBody`, `AuthSessionResponse`, `RefreshBody`) |
| `app/schemas/user.py` | 사용자 스키마(공개 정보/DB 모델/응답 별칭) |
| `app/schemas/common.py` | 공통 메시지 응답 스키마 |
| `app/services/users.py` | 이메일/ID 조회, 로컬/소셜 사용자 생성/연결 |
| `app/services/refresh_tokens.py` | refresh token(jti) DB 저장/활성검사/폐기(회전 지원) |
| `app/routers/auth.py` | 로컬 signup/login/refresh/me 및 토큰 발급 |
| `app/routers/social_auth.py` | 구글/카카오 start/callback/redirect 라우트 |

## 환경 변수

`.env` 또는 시스템 환경 변수. 이름은 대문자 스네이크 케이스(`pydantic-settings` 규칙).

| 변수 | 설명 |
|------|------|
| `MONGODB_URL` | MongoDB 연결 URI (로컬 또는 Atlas `mongodb+srv://...`) |
| `DATABASE_NAME` | 사용할 논리 DB 이름 (예: `dementia_app`) |
| `CORS_ORIGINS` | 허용 출처, 쉼표 구분 (예: `http://localhost:3000,http://127.0.0.1:3000`) |
| `JWT_SECRET_KEY` | access/refresh JWT 서명 키 |
| `ACCESS_TOKEN_EXPIRES_MINUTES` | accessToken 만료(분) |
| `REFRESH_TOKEN_EXPIRES_DAYS` | refreshToken 만료(일) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `KAKAO_REST_API_KEY` | Kakao REST API 키(client_id) |
| `KAKAO_CLIENT_SECRET` | Kakao Client Secret(사용 설정 시) |
| `SOCIAL_STATE_SECRET` | 소셜 로그인 `state` 서명 키 |
| `SOCIAL_REDIRECT_ALLOWLIST` | 허용 redirectUri 목록(쉼표 구분, **경로 포함 URL**) |

## MongoDB

- **위치**: URI가 가리키는 서버(로컬 `mongod` 또는 Atlas). 프로젝트 폴더 안에 DB 파일이 생기지는 않는다.
- **데이터베이스**: `DATABASE_NAME` 이름의 DB.
- **컬렉션**: `users`, `refresh_tokens`
- **users 문서 필드(신규 가입 기준)**:
  - `email` (소문자 저장, 유니크)
  - `name` (선택)
  - `password_hash` (로컬 가입 시 bcrypt 해시, 소셜 유저는 `null`)
  - `provider` (`local|google|kakao`)
  - `providers` (연결된 provider 목록)
  - `created_at`, `updated_at`
- **기동 시 인덱스**:
  - `users.email` 유니크
  - `users.providers.provider + users.providers.provider_user_id` 인덱스
  - `refresh_tokens (user_id, jti_hash)` 유니크

## HTTP API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/health` | `{"ok": true}` |
| GET | `/docs` | 전체 API  |
| POST | `/auth/signup` | 로컬 회원가입 → 201 + `UserProfile` |
| POST | `/auth/login` | 로컬 로그인(email/password) → 200 + `AuthSessionResponse` |
| POST | `/auth/refresh` | refreshToken으로 토큰 재발급(회전) → 200 + `AuthSessionResponse` |
| POST | `/auth/logout` | refreshToken 폐기 → 204 |
| GET | `/auth/me` | accessToken(Bearer)로 사용자 조회 → 200 + `UserProfile` 또는 401 |
| GET | `/auth/social/google/start` | 구글 OAuth start URL 발급 |
| GET | `/auth/social/kakao/start` | 카카오 OAuth start URL 발급 |
| POST | `/auth/social/google/callback` | (프론트 연동) code 교환 → `AuthSessionResponse` |
| POST | `/auth/social/kakao/callback` | (프론트 연동) code 교환 → `AuthSessionResponse` |
| GET | `/auth/social/google/redirect` | (프론트 없이) redirect에서 code/state 처리 → `AuthSessionResponse` |(백엔드 테스트 전용)
| GET | `/auth/social/kakao/redirect` | (프론트 없이) redirect에서 code/state 처리 → `AuthSessionResponse` |(백엔드 테스트 전용)


### 요청 본문 요약

- **signup**: `name`, `email`, `password`
- **login**: `email`, `password`
- **refresh/logout**: `refreshToken`

### 응답 `AuthSessionResponse` (login/refresh/소셜)

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "<MongoDB ObjectId 문자열>",
    "email": "<이메일>",
    "name": "<이름(선택)>"
  }
}
```

## 인증 흐름

1. `POST /auth/login`(또는 소셜 redirect/callback) 성공 시 `accessToken`, `refreshToken` 발급
2. 보호 API 호출 시 `Authorization: Bearer <accessToken>` 헤더로 인증
3. accessToken 만료 시 `POST /auth/refresh`로 재발급(회전)

## 실행

```bash
cd "폴더이름"
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

API 문서: `http://127.0.0.1:8000/docs`

## 의존성

`requirements.txt`: `fastapi`, `uvicorn[standard]`, `motor`, `passlib[bcrypt]`, `pydantic-settings`, `email-validator`, `python-jose[cryptography]`, `httpx`
