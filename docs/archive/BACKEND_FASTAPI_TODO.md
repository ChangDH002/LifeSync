# LifeSync Backend FastAPI TODO

- 작성일: 2026-04-20
- 기준 저장소: `E:/LifeSync`
- 목적: 현재 프론트 구현을 기준으로 FastAPI 백엔드에서 우선 구현해야 할 작업을 정리

---

## 1. 현재 상태 요약

### 이미 있는 것

- FastAPI 앱 기본 구조
  - `app/main.py`
  - `app/db.py`
  - `app/core/config.py`
- MongoDB 연결 및 `users` 컬렉션 인덱스
- 기본 인증 라우터
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/me`

### 아직 없는 것

- 프론트가 현재 호출하는 실제 API 대부분
  - `/auth/signup`
  - `/auth/social/...`
  - `/chatbot/messages`
  - `/training/participation`
  - `/mypage/summary`
  - `/avatar/me`
  - `/avatar/water`
  - `/routines/today`

### 가장 큰 불일치

1. 인증 요청 스펙 불일치
- 프론트:
  - 로그인: `email`, `password`
  - 회원가입: `name`, `email`, `password`
- 현재 백엔드:
  - 로그인: `username`, `password`
  - 회원가입: `username`, `email`, `password`

2. 인증 방식 불일치
- 프론트: `Bearer access token` 기대
- 현재 백엔드: `SessionMiddleware` 기반 쿠키 세션

3. 응답 형식 불일치
- 프론트는 `response.data`를 그대로 사용
- 즉, `{ success, data, meta }` 같은 래퍼보다 바로 필요한 JSON 객체를 반환해야 연동이 쉬움

---

## 2. 가장 먼저 결정할 것

## TODO 2.1 인증 방식 통일

- 추천: 프론트 기준으로 `Bearer Access Token` 방식으로 통일
- 이유:
  - 프론트 `LifeSync-frontend/src/shared/api/client.ts`가 이미 `Authorization` 헤더를 붙이는 구조
  - 소셜 로그인/모바일 확장까지 고려하면 토큰 기반이 더 자연스럽다

### 해야 할 일

- [ ] 세션 쿠키 기반 유지 여부 최종 결정
- [ ] 토큰 기반으로 갈 경우 JWT 발급 방식 도입
- [ ] `accessToken`, `refreshToken` 반환 형식 확정
- [ ] 프론트와 응답 JSON shape 최종 합의

---

## 3. 1순위 작업: Auth 재설계

## TODO 3.1 `auth` 스키마 수정

대상 파일:
- `app/schemas/auth.py`
- `app/schemas/user.py`

### 해야 할 일

- [ ] `RegisterBody`를 프론트 기준으로 변경
  - `name: str`
  - `email: EmailStr`
  - `password: str`
- [ ] `LoginBody`를 프론트 기준으로 변경
  - `email: EmailStr`
  - `password: str`
- [ ] 응답용 세션 스키마 추가

예시:

```py
class AuthSessionResponse(BaseModel):
    accessToken: str
    refreshToken: str | None = None
    user: UserProfile | None = None
```

- [ ] 사용자 공개 응답에 `name` 필드 포함
- [ ] 기존 `username`이 정말 필요한지 재검토

## TODO 3.2 `users` 서비스 수정

대상 파일:
- `app/services/users.py`
- `app/db.py`

### 해야 할 일

- [ ] 사용자 생성 시 `name` 저장
- [ ] 이메일 기준 조회 로직을 로그인 기준으로 사용
- [ ] `username` 인덱스를 유지할지 제거할지 결정
- [ ] 필요 시 `refresh_tokens` 또는 세션 관련 컬렉션 설계

추천 사용자 문서 예시:

```json
{
  "_id": "ObjectId",
  "name": "강민",
  "email": "kangmin@lifesync.kr",
  "password_hash": "...",
  "provider": "local",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

## TODO 3.3 `auth` 라우터 재작성

대상 파일:
- `app/routers/auth.py`

### 해야 할 일

- [ ] `POST /auth/register` 대신 `POST /auth/signup` 제공
- [ ] `POST /auth/login`을 이메일 로그인으로 변경
- [ ] 응답을 `UserOut`이 아니라 `AuthSessionResponse`로 변경
- [ ] `POST /auth/logout` 유지 여부 결정
- [ ] `GET /auth/me`를 토큰 기반 사용자 조회로 변경

프론트가 기대하는 응답 예시:

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "user_1",
    "email": "kangmin@lifesync.kr",
    "name": "강민"
  }
}
```

## TODO 3.4 소셜 로그인 라우터 추가

새 파일 추천:
- `app/routers/social_auth.py`
- 또는 `app/routers/auth.py` 안에 확장

### 구현 대상

- [ ] `GET /auth/social/google/start`
- [ ] `GET /auth/social/kakao/start`
- [ ] `POST /auth/social/google/callback`
- [ ] `POST /auth/social/kakao/callback`

### 프론트 요청 형식

#### 시작 URL

Query:
- `mode=login | signup`
- `redirectUri=<frontend callback url>`

#### 콜백 교환

```json
{
  "provider": "google",
  "code": "oauth-code",
  "state": "optional-state",
  "redirectUri": "https://.../auth/callback/google"
}
```

### 구현 메모

- [ ] 구글 OAuth 클라이언트 설정 추가
- [ ] 카카오 REST API 키 설정 추가
- [ ] 신규 유저 자동 가입 정책 확정
- [ ] 기존 이메일 계정과 소셜 계정 충돌 정책 확정

---

## 4. 2순위 작업: Chatbot API

## TODO 4.1 챗봇 메시지 전송 API 추가

새 파일 추천:
- `app/routers/chatbot.py`
- `app/schemas/chatbot.py`
- `app/services/chatbot.py`

### 구현 대상

- [ ] `POST /chatbot/messages`

### Request

```json
{
  "sessionId": "chat_001",
  "message": "인지 건강을 위해 오늘 실천할 수 있는 습관 알려줘",
  "history": [
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

### Response

```json
{
  "sessionId": "chat_001",
  "answer": "오늘은 10분 정도 가볍게 걷는 것부터 시작해보세요.",
  "sources": [
    {
      "title": "인지 건강 가이드",
      "url": "https://example.com"
    }
  ]
}
```

### 구현 메모

- [ ] 세션 ID가 없으면 생성
- [ ] 세션이 있으면 대화 이어받기
- [ ] 처음엔 더미 응답으로라도 shape 맞추기
- [ ] 나중에 RAG/LLM 호출 분리 가능하도록 서비스 계층 설계

---

## 5. 3순위 작업: 인지훈련 참여 API

## TODO 5.1 훈련 참여 기록 동기화 API 추가

새 파일 추천:
- `app/routers/training.py`
- `app/schemas/training.py`
- `app/services/training.py`

### 구현 대상

- [ ] `POST /training/participation`

### Request

```json
{
  "gameCategory": "memory",
  "gameName": "카드 짝 맞추기",
  "eventType": "participated",
  "occurredAt": "2026-04-20T09:10:32.000Z",
  "attendanceCandidate": true,
  "wateringChanceCandidate": true,
  "metadata": {
    "timeLeft": 84
  }
}
```

### Response

```json
{
  "attendanceMarked": true,
  "wateringChanceGranted": true,
  "dailyWateringChanceAvailable": true
}
```

### 구현 메모

- [ ] 사용자별 일자 기준 출석 1회 처리
- [ ] 사용자별 일자 기준 물주기 기회 1회 지급
- [ ] 중복 이벤트 처리 방지
- [ ] 추후 게임 결과 저장 테이블/컬렉션 확장 가능하게 설계

추천 컬렉션:
- `training_events`
- `attendance_logs`
- `watering_chances`

---

## 6. 4순위 작업: Avatar / Tree Garden

## TODO 6.1 내 나무 조회 API 추가

새 파일 추천:
- `app/routers/avatar.py`
- `app/schemas/avatar.py`
- `app/services/avatar.py`

### 구현 대상

- [ ] `GET /avatar/me`

### Response 예시

```json
{
  "id": "tree-ginkgo",
  "name": "은행나무",
  "level": 3,
  "experience": 220,
  "maxExperience": 500,
  "waterCount": 11,
  "stage": 3,
  "maxStage": 6,
  "treeType": "ginkgo",
  "dailyWateringChanceAvailable": true
}
```

## TODO 6.2 물주기 실행 API 추가

### 구현 대상

- [ ] `POST /avatar/water`

### Response 예시

```json
{
  "used": true,
  "wateringChanceRemaining": 0,
  "expGained": 20,
  "avatar": {
    "id": "tree-ginkgo",
    "name": "은행나무",
    "level": 4,
    "experience": 300,
    "maxExperience": 500,
    "waterCount": 15,
    "stage": 4,
    "maxStage": 6,
    "treeType": "ginkgo",
    "dailyWateringChanceAvailable": false
  }
}
```

### 구현 메모

- [ ] 하루 물주기 기회 확인
- [ ] 성공 시 기회 차감
- [ ] 경험치 20 증가
- [ ] 100 XP 단위로 단계 상승
- [ ] 최대 단계 6 유지

### 현재 프론트 계산식

- 물주기 1회당 경험치: `20`
- 단계당 필요 경험치: `100`
- 최대 단계: `6`
- 최대 경험치: `500`

---

## 7. 5순위 작업: 마이페이지 요약 API

## TODO 7.1 마이페이지 요약 데이터 API 추가

새 파일 추천:
- `app/routers/mypage.py`
- `app/schemas/mypage.py`
- `app/services/mypage.py`

### 구현 대상

- [ ] `GET /mypage/summary`

### Response 구조

```json
{
  "user": {
    "id": "user_1",
    "name": "강민",
    "email": "kangmin@lifesync.kr",
    "joinedLabel": "가입 1분 미만"
  },
  "survey": {
    "needsUpdate": true,
    "bannerTitle": "생활습관 설문을 작성해주세요",
    "bannerDescription": "설문을 통해 현재 상태를 파악하고 맞춤형 루틴 추천을 받아보세요."
  },
  "summary": {
    "streakDays": 5,
    "todayRoutineCompleted": 2,
    "todayRoutineTotal": 3,
    "weeklyAchievementRate": 68,
    "trainingCompletedCount": 4
  },
  "recentActivities": [
    {
      "title": "아침 산책 루틴 완료",
      "detail": "오늘 오전 8:10",
      "type": "routine"
    }
  ],
  "tabs": {
    "survey": {
      "heading": "생활습관 설문 요약",
      "description": "최근 설문 요약 설명",
      "bullets": ["수면 규칙성 양호"]
    },
    "routine": {
      "heading": "이번 주 루틴 진행 현황",
      "description": "루틴 설명",
      "bullets": ["저녁 스트레칭 3회 완료"]
    },
    "training": {
      "heading": "인지훈련 요약",
      "description": "훈련 설명",
      "bullets": ["기억력 카드 3회 플레이"]
    }
  }
}
```

### 구현 메모

- [ ] 사용자 기본 정보 조합
- [ ] 출석/루틴/훈련 지표 계산
- [ ] 최근 활동 feed 생성
- [ ] 탭 데이터는 초기에는 서버에서 단순 조합 문자열로 내려도 충분

---

## 8. 6순위 작업: 오늘 루틴 API

## TODO 8.1 오늘 루틴 조회 API 추가

새 파일 추천:
- `app/routers/routines.py`
- `app/schemas/routines.py`
- `app/services/routines.py`

### 구현 대상

- [ ] `GET /routines/today`

### Response 예시

```json
{
  "items": [
    {
      "id": "routine_1",
      "title": "식사 후 10분 가벼운 걷기",
      "completed": false
    },
    {
      "id": "routine_2",
      "title": "하루 한 번 가족 또는 지인과 대화하기",
      "completed": true
    }
  ]
}
```

### 구현 메모

- [ ] 설문 결과 기반 추천으로 확장 가능한 구조
- [ ] 현재는 정적 추천 + 사용자 완료 여부만 있어도 충분

---

## 9. 파일 구조 확장 제안

현재 `app/` 구조를 유지하면서 아래 정도로 확장하는 것을 추천합니다.

```text
app/
├── core/
├── routers/
│   ├── auth.py
│   ├── social_auth.py
│   ├── chatbot.py
│   ├── training.py
│   ├── avatar.py
│   ├── mypage.py
│   └── routines.py
├── schemas/
│   ├── auth.py
│   ├── chatbot.py
│   ├── training.py
│   ├── avatar.py
│   ├── mypage.py
│   ├── routines.py
│   ├── user.py
│   └── common.py
├── services/
│   ├── users.py
│   ├── auth_tokens.py
│   ├── chatbot.py
│   ├── training.py
│   ├── avatar.py
│   ├── mypage.py
│   └── routines.py
```

---

## 10. 구현 순서 추천

### Phase 1

- [ ] Auth 이메일 로그인/회원가입 스펙 수정
- [ ] 토큰 발급/검증 방식 추가
- [ ] `/auth/me` 정리

### Phase 2

- [ ] 소셜 로그인 2종
- [ ] `/chatbot/messages`
- [ ] `/training/participation`

### Phase 3

- [ ] `/avatar/me`
- [ ] `/avatar/water`
- [ ] `/mypage/summary`
- [ ] `/routines/today`

### Phase 4

- [ ] 테스트 코드 추가
- [ ] 공통 에러 응답 정리
- [ ] 로깅/환경 변수 정리

---

## 11. 검증 체크리스트

- [ ] 프론트 `POST /auth/login` 호출이 실제 성공하는지
- [ ] 프론트 `POST /auth/signup` 호출이 실제 성공하는지
- [ ] 토큰 저장 후 인증 헤더로 보호 API가 열리는지
- [ ] 챗봇 질문 전송 시 `answer`가 UI에 보이는지
- [ ] 인지훈련 첫 플레이 시 참여 이벤트가 저장되는지
- [ ] 물주기 기회가 하루 1회만 지급되는지
- [ ] 나무 상태 조회와 물주기 결과가 일관되게 반영되는지
- [ ] 마이페이지와 루틴 페이지가 fallback이 아니라 실제 응답으로 채워지는지

---

## 12. 한 줄 결론

지금 백엔드의 첫 번째 목표는 “FastAPI 구조를 더 늘리는 것”이 아니라, **프론트가 이미 호출하고 있는 API 계약에 맞춰 인증/챗봇/훈련/나무/마이페이지를 차례대로 채우는 것**입니다.
