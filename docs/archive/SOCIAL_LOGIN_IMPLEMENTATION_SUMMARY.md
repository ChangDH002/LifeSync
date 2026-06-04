# 소셜 로그인 구현 정리 (Google + Kakao)

이 문서는 현재 리포지토리에 추가/변경된 소셜 로그인 구현 내용을 한 눈에 볼 수 있도록 정리한 것입니다.

---

## 1) 제공 API 목록

### 1.1 Start (OAuth 인증 URL 생성)

- `GET /auth/social/google/start?mode=login|signup&redirectUri=<프론트콜백URL>`
- `GET /auth/social/kakao/start?mode=login|signup&redirectUri=<프론트콜백URL>`

응답:

```json
{ "url": "<provider_auth_url>", "state": "<signed_state>" }
```

### 1.2 Callback (code 교환 → 우리 서비스 토큰 발급)

- `POST /auth/social/google/callback`
- `POST /auth/social/kakao/callback`

요청 바디:

```json
{
  "provider": "google|kakao",
  "code": "<oauth-code>",
  "state": "<state>",
  "redirectUri": "<프론트콜백URL>"
}
```

성공 응답(`AuthSessionResponse`):

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": { "id": "user_id", "email": "email@example.com", "name": "이름" }
}
```

---

## 2) 계정 연결 정책(중요)

- **이메일 기준 자동 연결(auto_link)**:
  - 동일 이메일의 기존 계정(local 포함)이 이미 있으면, 그 유저 문서에 provider 연결을 추가합니다.
  - 신규 이메일이면 소셜 유저를 생성합니다.

---

## 3) 파일별 역할(추가/변경)

### 3.1 의존성/환경변수

- `requirements.txt` (**변경**)
  - `httpx` 추가: provider 토큰/유저정보 API 호출에 사용

- `.env.example` (**변경**)
  - OAuth/JWT 관련 키 템플릿 추가

- `app/core/config.py` (**변경**)
  - OAuth 설정:
    - `google_client_id`, `google_client_secret`
    - `kakao_rest_api_key`, `kakao_client_secret`
  - state/redirect 검증:
    - `social_state_secret`, `social_state_expires_minutes`
    - `social_redirect_allowlist` + `social_redirect_allowlist_list`

### 3.2 스키마

- `app/schemas/social_auth.py` (**신규**)
  - `SocialStartResponse(url, state)`
  - `SocialCallbackBody(provider?, code, state?, redirectUri)`

### 3.3 서비스

- `app/services/social_auth.py` (**신규**)
  - start URL 생성:
    - `build_google_auth_url()`, `build_kakao_auth_url()`
  - state 서명/검증:
    - `create_state()`, `decode_state()`
  - code 교환 및 유저 정보 조회:
    - `exchange_google_code()`, `exchange_kakao_code()`
  - 계정 생성/연결:
    - `resolve_user_by_social()`

- `app/services/users.py` (**변경**)
  - 소셜 유저 생성/연결 지원:
    - `create_social_user()`
    - `link_social_provider()`
  - `create_user()`도 `providers[]`를 함께 저장하도록 확장

### 3.4 라우터/마운트

- `app/routers/social_auth.py` (**신규**)
  - `/auth/social/*` 4개 엔드포인트 구현
  - callback 성공 시:
    - `accessToken` 발급
    - `refreshToken` 발급 + DB 저장
    - `AuthSessionResponse` 반환

- `app/main.py` (**변경**)
  - `social_auth` 라우터 마운트 추가:
    - `app.include_router(social_auth.router, prefix="/auth/social", tags=["social_auth"])`

### 3.5 DB 인덱스

- `app/db.py` (**변경**)
  - `users.providers.provider + users.providers.provider_user_id` 인덱스 추가(조회/중복 방지 기반)

---

## 4) refreshToken 처리(현재 방식)

- refreshToken은 JWT로 발급하고, 내부 `jti`를 DB(`refresh_tokens`)에 **해시 저장**합니다.
- `/auth/refresh`는 refreshToken을 **회전(rotate)** 합니다.
  - 기존 refreshToken 폐기 → 신규 refreshToken 발급/저장 → 신규 accessToken 발급

관련 파일:

- `app/core/jwt.py`
- `app/services/refresh_tokens.py`
- `app/routers/auth.py`

---

## 5) 흐름 순서도(START → CALLBACK → JWT 발급)

```mermaid
flowchart TD
  Client[Client_Frontend] -->|GET_/auth/social/{provider}/start?mode&redirectUri| BackendStart[Backend_social_start]
  BackendStart -->|validate_redirectUri_allowlist| RedirectCheck[RedirectAllowlist]
  BackendStart -->|create_state_signed| State[State_JWT]
  BackendStart -->|return_{url,state}| Client
  Client -->|open_url_in_browser| ProviderAuth[Provider_Login_Consent]
  ProviderAuth -->|redirect_to_redirectUri?code&state| ClientCallback[Frontend_Callback_Page]
  ClientCallback -->|POST_/auth/social/{provider}/callback {code,state,redirectUri}| BackendCallback[Backend_social_callback]
  BackendCallback -->|decode_state + redirectUri_match| StateVerify[State_Verify]
  BackendCallback -->|exchange_code_for_access_token| ProviderToken[Provider_Token_Endpoint]
  BackendCallback -->|fetch_userinfo| ProviderUserinfo[Provider_Userinfo_API]
  BackendCallback -->|resolve_user_by_email + auto_link| UserResolve[User_Resolve_LinkOrCreate]
  UserResolve -->|create_accessToken| AccessJWT[AccessToken_JWT]
  UserResolve -->|create_refreshToken(jti)| RefreshJWT[RefreshToken_JWT]
  UserResolve -->|store_jti_hash_in_DB| RefreshDB[(MongoDB_refresh_tokens)]
  BackendCallback -->|return_AuthSessionResponse| Client

  Client -->|Authorization_Bearer_accessToken| BackendMe[GET_/auth/me]
  BackendMe -->|decode_access_token| AccessVerify[Access_Verify]
  BackendMe -->|get_user_by_id| UsersDB[(MongoDB_users)]
  BackendMe -->|return_user| Client
```

## 6) 구현 상세(파일/함수별 역할)

### 6.1 `app/routers/social_auth.py` (신규)

- **`google_start()`**: 구글 OAuth 인증 URL(`url`)과 `state`를 생성해 반환
- **`kakao_start()`**: 카카오 OAuth 인증 URL(`url`)과 `state`를 생성해 반환
- **`google_callback()`**: `state` 검증 → 구글 `code` 교환 → 유저 연결/생성 → `accessToken/refreshToken` 발급 및 refresh DB 저장 → `AuthSessionResponse` 반환
- **`kakao_callback()`**: 위와 동일 흐름을 카카오로 수행

### 6.2 `app/services/social_auth.py` (신규)

- **`_validate_redirect_uri()`**: `redirectUri`가 allowlist에 포함되는지 검사(오픈 리다이렉트 방지)
- **`create_state()` / `decode_state()`**: start에서 state를 **서명/만료 포함**으로 만들고, callback에서 검증
- **`build_google_auth_url()` / `build_kakao_auth_url()`**: provider 로그인 페이지 URL 생성
- **`exchange_google_code()` / `exchange_kakao_code()`**: `code`를 provider token으로 교환하고 userinfo에서 `(email,name,provider_user_id)` 추출
- **`resolve_user_by_social()`**: 이메일 기준 자동 연결 정책 구현(없으면 생성, 있으면 provider 연결 추가)

### 6.3 `app/services/users.py` (변경)

- **`create_social_user()`**: 소셜 계정 신규 생성(비밀번호 없음, `providers[]` 포함)
- **`link_social_provider()`**: 기존 유저에 provider 연결을 `$addToSet`으로 추가(중복 방지)
- **`create_user()`(로컬 가입)**: `providers[]`를 함께 저장하도록 확장(연결 구조 일관성)

### 6.4 `app/services/refresh_tokens.py` (기존)

- **`store_refresh_token()`**: refresh JWT의 `jti`를 sha256 해시로 저장(원문 토큰 저장 X)
- **`is_refresh_token_active()`**: refresh 토큰이 폐기되지 않았고 만료 전인지 확인
- **`revoke_refresh_token()`**: refresh 토큰 폐기(로그아웃/회전에서 사용)

### 6.5 `app/core/jwt.py` (기존/확장)

- **`create_access_token()` / `decode_access_token()`**: access JWT 발급/검증(`type=access`)
- **`create_refresh_token()` / `decode_refresh_token()`**: refresh JWT 발급/검증(`type=refresh`, `jti` 포함)

### 6.6 `app/db.py` (변경)

- **users 인덱스**: `email` unique + `providers.provider/providers.provider_user_id` 인덱스(조회 기반)
- **refresh_tokens 인덱스**: `(user_id, jti_hash)` unique + `expires_at` 인덱스

### 6.7 `app/main.py` (변경)

- **라우터 마운트**: `/auth` + `/auth/social`을 앱에 등록

---

## 7) 수동 테스트

- `SOCIAL_LOGIN_MANUAL_TEST.md` 참고
  - start → 브라우저 로그인 → code 확보 → callback → 토큰 발급 → `/auth/me` 확인

