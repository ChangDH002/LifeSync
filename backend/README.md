# LifeSync Backend (FastAPI)

FastAPI + Motor(MongoDB) 기반 메인 백엔드입니다. 인증은 **Bearer JWT(access/refresh)** 기반이며,
설문·인지훈련·루틴·아바타·챗봇·마이페이지 등 핵심 도메인 API를 제공합니다.

## 실행 방법

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://127.0.0.1:8000
```

- API 문서(Swagger): `http://127.0.0.1:8000/docs`
- 헬스 체크: `GET /health` → `{"ok": true}`
- MongoDB가 `MONGODB_URL`로 접근 가능해야 합니다(로컬 `mongod` 또는 Atlas).

## 환경 변수

루트의 [`.env.example`](../.env.example)를 복사해 `backend/.env`(또는 실행 위치의 `.env`)로 만들고 값을 채웁니다.
이름은 대문자 스네이크 케이스(`pydantic-settings` 규칙).

| 변수 | 설명 |
|------|------|
| `MONGODB_URL` | MongoDB 연결 URI (로컬 또는 Atlas `mongodb+srv://...`) |
| `DATABASE_NAME` | 사용할 논리 DB 이름 (예: `dementia_app`) |
| `CORS_ORIGINS` | 허용 출처, 쉼표 구분 |
| `JWT_SECRET_KEY` | access/refresh JWT 서명 키 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `KAKAO_REST_API_KEY` / `KAKAO_CLIENT_SECRET` | Kakao OAuth |
| `SOCIAL_STATE_SECRET` | 소셜 로그인 `state` 서명 키 |
| `SOCIAL_REDIRECT_ALLOWLIST` | 허용 redirectUri 목록(쉼표 구분, 경로 포함 URL) |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Gemini AI 연동 |
| `SBERT_MODEL_NAME` / `SBERT_DATASET_PATH` | SBERT 모델/데이터셋 경로(기본값은 `app/data/...` 상대 경로) |

> ⚠️ 실제 비밀키는 절대 커밋하지 않습니다. `.env`는 `.gitignore`로 제외되어 있습니다.

## 디렉터리 구조

```text
backend/
├── requirements.txt
├── tests/                 # pytest 테스트 (test_ai_features.py 등)
└── app/
    ├── main.py            # FastAPI 앱, 미들웨어, lifespan, 라우터 마운트
    ├── db.py              # Motor 클라이언트, 연결/종료, 인덱스 생성
    ├── core/              # config(설정), jwt, password_hash
    ├── routers/           # auth, social_auth, survey, training, routines, avatar, chatbot, mypage, ai
    ├── schemas/           # 요청/응답 Pydantic 스키마
    ├── services/          # 도메인 로직 (users, survey, routines, training, persona, sbert_retriever 등)
    ├── repositories/      # 데이터 접근 계층
    └── data/              # 시드/데이터셋 (dementia_question_dataset_7000.csv 등)
```

## 주요 HTTP API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/health` | 헬스 체크 `{"ok": true}` |
| GET | `/docs` | Swagger API 문서 |
| POST | `/auth/signup` | 로컬 회원가입 |
| POST | `/auth/login` | 로컬 로그인 → `AuthSessionResponse` |
| POST | `/auth/refresh` | refreshToken으로 토큰 재발급(회전) |
| POST | `/auth/logout` | refreshToken 폐기 |
| GET | `/auth/me` | accessToken(Bearer)로 사용자 조회 |
| GET | `/auth/social/{google\|kakao}/start` | 소셜 OAuth start URL 발급 |
| POST | `/auth/social/{google\|kakao}/callback` | code 교환 → `AuthSessionResponse` |
| `*` | `/survey`, `/training`, `/routines`, `/avatar`, `/chatbot`, `/mypage`, `/ai` | 도메인별 라우터 |

## 인증 흐름

1. `POST /auth/login`(또는 소셜 callback) 성공 시 `accessToken`, `refreshToken` 발급
2. 보호 API 호출 시 `Authorization: Bearer <accessToken>` 헤더로 인증
3. accessToken 만료 시 `POST /auth/refresh`로 재발급(회전)

## 테스트

```bash
cd backend
set PYTHONPATH=.        # Windows (macOS/Linux: export PYTHONPATH=.)
pytest -q
```

## 의존성

`requirements.txt`: `fastapi`, `uvicorn[standard]`, `motor`, `passlib[bcrypt]`, `pydantic-settings`,
`email-validator`, `python-jose[cryptography]`, `httpx`, `google-generativeai`, `sentence-transformers`,
`pandas`, `numpy`, `scikit-learn`, `pytest`, `pytest-asyncio`.
