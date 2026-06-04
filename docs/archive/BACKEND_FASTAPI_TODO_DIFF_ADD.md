# BACKEND_FASTAPI_TODO 비교 결과: 추가해야 할 것들

- 비교 기준: `c:\Users\SeaDo\Downloads\BACKEND_FASTAPI_TODO.md`
- 현재 프로젝트: `dementia/` (FastAPI + Motor + **세션 쿠키** 기반 `/auth/*`)

---

## 결론(요약)

현재 백엔드는 **세션 쿠키 + username 로그인**으로만 구성되어 있어, TODO 문서가 요구하는 **Bearer 토큰 기반 인증(이메일 로그인/회원가입)**과 프론트 호출 API(챗봇/훈련/아바타/마이페이지/루틴)가 대부분 미구현입니다.

---

## 1) 인증/응답 계약 불일치로 인해 “추가/변경”이 필요한 것

### 1.1 인증 방식 통일(세션 → Bearer 토큰)

- [ ] **토큰 기반(JWT 등) 발급/검증** 모듈 추가 (`accessToken`, `refreshToken` 설계)
- [ ] 보호 API에서 `Authorization: Bearer <token>` 인증 처리 추가
- [ ] 세션(`SessionMiddleware`) 유지/제거 결정 및 정리
  - 현재: `app/main.py`에서 `SessionMiddleware` 사용

### 1.2 Auth 요청 스키마 변경(username → email, name 추가)

현재 스키마: `app/schemas/auth.py`

- [ ] `RegisterBody`를 프론트 기준으로 변경: `name`, `email`, `password`
- [ ] `LoginBody`를 프론트 기준으로 변경: `email`, `password`
- [ ] Auth 응답 스키마 추가(예: `AuthSessionResponse`)
  - `{ accessToken, refreshToken, user }`

### 1.3 Auth 라우트 계약 변경(/register → /signup 등)

현재 라우터: `app/routers/auth.py`

- [ ] `POST /auth/register` 대신(또는 함께) `POST /auth/signup` 추가
- [ ] `POST /auth/login`을 이메일 로그인으로 변경
- [ ] `GET /auth/me`를 토큰 기반 사용자 조회로 변경
- [ ] `POST /auth/logout`을 토큰 정책에 맞게 유지/수정(리프레시 토큰 폐기 등)

### 1.4 응답 형태 정리(CommonResponse 사용 여부)

현재 코드베이스에 `app/schemas/common.py`의 `CommonResponse`가 존재하지만, 라우터는 `UserOut` “직접 반환” 형태입니다.

- [ ] 프론트 연동 기준으로 **래퍼(`{success,data}`)를 쓸지/안 쓸지** 결정
- [ ] 결정에 따라 전 엔드포인트 응답 shape 통일

---

## 2) TODO 문서 기준 “추가 구현”이 필요한 API 목록(현재 미존재)

### 2.1 소셜 로그인

- [ ] `GET /auth/social/google/start`
- [ ] `GET /auth/social/kakao/start`
- [ ] `POST /auth/social/google/callback`
- [ ] `POST /auth/social/kakao/callback`

추천 파일(신규):

- [ ] `app/routers/social_auth.py`
- [ ] `app/services/social_auth.py` (또는 provider 별 분리)
- [ ] `app/schemas/social_auth.py`

### 2.2 챗봇

- [ ] `POST /chatbot/messages`

추천 파일(신규):

- [ ] `app/routers/chatbot.py`
- [ ] `app/services/chatbot.py`
- [ ] `app/schemas/chatbot.py`

### 2.3 인지훈련 참여

- [ ] `POST /training/participation`

추천 파일(신규):

- [ ] `app/routers/training.py`
- [ ] `app/services/training.py`
- [ ] `app/schemas/training.py`

### 2.4 Avatar / Tree Garden

- [ ] `GET /avatar/me`
- [ ] `POST /avatar/water`

추천 파일(신규):

- [ ] `app/routers/avatar.py`
- [ ] `app/services/avatar.py`
- [ ] `app/schemas/avatar.py`

### 2.5 마이페이지 요약

- [ ] `GET /mypage/summary`

추천 파일(신규):

- [ ] `app/routers/mypage.py`
- [ ] `app/services/mypage.py`
- [ ] `app/schemas/mypage.py`

### 2.6 오늘 루틴

- [ ] `GET /routines/today`

추천 파일(신규):

- [ ] `app/routers/routines.py`
- [ ] `app/services/routines.py`
- [ ] `app/schemas/routines.py`

---

## 3) 데이터/컬렉션 측면에서 추가 고려(현재 users 중심)

`app/services/users.py`와 `users` 컬렉션 중심 구조만 존재합니다.

- [ ] 사용자 문서에 `name`, `provider(local/google/kakao)` 등 확장 필요 여부 결정
- [ ] 훈련/출석/물주기 관련 컬렉션 설계 및 인덱스 추가
  - 예: `training_events`, `attendance_logs`, `watering_chances`, `avatars` 등

---

## 4) 추천 구현 순서(현재 리포지토리 기준)

- [ ] Phase 1: 인증 방식/스키마/라우터 계약부터 프론트 기준으로 정렬
- [ ] Phase 2: `/chatbot/messages`, `/training/participation`
- [ ] Phase 3: `/avatar/*`, `/mypage/summary`, `/routines/today`
- [ ] Phase 4: 테스트/에러 응답/로깅/환경변수 정리

