# 소셜 로그인 수동 테스트 가이드 (Google + Kakao)

## 0) 사전 준비

- `.env`에 아래 값들이 설정되어 있어야 합니다.
  - `JWT_SECRET_KEY`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `KAKAO_REST_API_KEY` (필요 시 `KAKAO_CLIENT_SECRET`)
  - `SOCIAL_STATE_SECRET`
  - `SOCIAL_REDIRECT_ALLOWLIST` (예: `http://localhost:3000,http://127.0.0.1:3000`)

서버 실행:

```bash
uvicorn app.main:app --reload
```

## 1) Google Start URL 발급

```bash
curl "http://127.0.0.1:8000/auth/social/google/start?mode=login&redirectUri=http://localhost:3000/auth/callback/google"
```

응답에서 `url`로 브라우저를 열어 구글 로그인을 진행합니다.

## 2) Google Callback (code 교환 → 우리 토큰 발급)

구글 로그인 완료 후 프론트 콜백 URL에서 `code` 값을 확보한 뒤, 아래처럼 호출합니다.

```bash
curl -X POST "http://127.0.0.1:8000/auth/social/google/callback" ^
  -H "Content-Type: application/json" ^
  -d "{\"provider\":\"google\",\"code\":\"<CODE>\",\"state\":\"<STATE>\",\"redirectUri\":\"http://localhost:3000/auth/callback/google\"}"
```

성공 시 `AuthSessionResponse`:

- `accessToken`
- `refreshToken`
- `user` (`id/email/name`)

## 3) Kakao Start URL 발급

```bash
curl "http://127.0.0.1:8000/auth/social/kakao/start?mode=login&redirectUri=http://localhost:3000/auth/callback/kakao"
```

## 4) Kakao Callback

```bash
curl -X POST "http://127.0.0.1:8000/auth/social/kakao/callback" ^
  -H "Content-Type: application/json" ^
  -d "{\"provider\":\"kakao\",\"code\":\"<CODE>\",\"state\":\"<STATE>\",\"redirectUri\":\"http://localhost:3000/auth/callback/kakao\"}"
```

## 5) accessToken으로 보호 API 확인 (/auth/me)

```bash
curl "http://127.0.0.1:8000/auth/me" ^
  -H "Authorization: Bearer <accessToken>"
```

## 6) refreshToken 재발급 확인 (/auth/refresh)

```bash
curl -X POST "http://127.0.0.1:8000/auth/refresh" ^
  -H "Content-Type: application/json" ^
  -d "{\"refreshToken\":\"<refreshToken>\"}"
```

## 7) 로그아웃(Refresh 토큰 폐기)

```bash
curl -X POST "http://127.0.0.1:8000/auth/logout" ^
  -H "Content-Type: application/json" ^
  -d "{\"refreshToken\":\"<refreshToken>\"}"
```

