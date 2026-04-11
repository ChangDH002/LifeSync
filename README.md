# 프로젝트 구조 (Dementia API)

FastAPI + Motor(MongoDB) 기반 백엔드. 회원가입·로그인은 **세션 쿠키**(`SessionMiddleware`)를 사용한다.

## 디렉터리 구조

```
dementia/
├── .env                 # 로컬 전용 (Git 제외). .env.example 참고
├── .env.example         # 환경 변수 예시
├── .gitignore
├── requirements.txt
├── docs/
│   └── PROJECT_STRUCTURE.md   # 본 문서
└── app/
    ├── __init__.py
    ├── main.py          # FastAPI 앱, 미들웨어, lifespan, 라우터 마운트
    ├── db.py            # Motor 클라이언트, 연결/종료, 인덱스 생성
    ├── core/
    │   ├── __init__.py
    │   └── config.py    # pydantic-settings (.env 로드)
    ├── routers/
    │   ├── __init__.py
    │   └── auth.py      # /auth/* 엔드포인트
    ├── schemas/
    │   ├── __init__.py
    │   └── user.py      # RegisterBody, LoginBody, UserOut
    └── services/
        ├── __init__.py
        └── users.py     # 비밀번호 해시, 사용자 CRUD 조회
```

## 계층 역할

| 경로 | 역할 |
|------|------|
| `app/main.py` | 앱 생성, `lifespan`에서 DB 연결, `SessionMiddleware`·`CORSMiddleware`, `auth` 라우터 prefix `/auth` |
| `app/core/config.py` | `MONGODB_URL`, `DATABASE_NAME`, `SECRET_KEY`, `CORS_ORIGINS` 등 설정 싱글톤 `settings` |
| `app/db.py` | `AsyncIOMotorClient`, `get_db()`, 기동 시 `ping` 및 `users` 컬렉션 인덱스 |
| `app/schemas/user.py` | 요청/응답 Pydantic 모델 |
| `app/services/users.py` | bcrypt 해시·검증, 이메일/아이디/ID 조회, 사용자 생성 |
| `app/routers/auth.py` | HTTP 라우트 및 세션에 `user_id` 저장 |

## 환경 변수

`.env` 또는 시스템 환경 변수. 이름은 대문자 스네이크 케이스(`pydantic-settings` 규칙).

| 변수 | 설명 |
|------|------|
| `MONGODB_URL` | MongoDB 연결 URI (로컬 또는 Atlas `mongodb+srv://...`) |
| `DATABASE_NAME` | 사용할 논리 DB 이름 (예: `dementia_app`) |
| `SECRET_KEY` | 세션 쿠키 서명용 비밀 문자열 |
| `CORS_ORIGINS` | 허용 출처, 쉼표 구분 (예: `http://localhost:3000,http://127.0.0.1:3000`) |

## MongoDB

- **위치**: URI가 가리키는 서버(로컬 `mongod` 또는 Atlas). 프로젝트 폴더 안에 DB 파일이 생기지는 않는다.
- **데이터베이스**: `DATABASE_NAME` 이름의 DB.
- **컬렉션**: `users`
- **문서 필드(신규 가입 기준)**:
  - `username` (소문자 저장, 유니크, sparse 인덱스)
  - `email` (소문자 저장, 유니크)
  - `password_hash` (bcrypt)
- **기동 시 인덱스**: `email` 유니크, `username` 유니크 sparse

## HTTP API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/health` | `{"ok": true}` |
| GET | `/docs` | 전체 API  |
| POST | `/auth/register` | 회원가입 → 201 + `UserOut` |
| POST | `/auth/login` | 로그인, 세션 쿠키 설정 → 200 + `UserOut` |
| POST | `/auth/logout` | 세션 제거 → 204 |
| GET | `/auth/me` | 세션의 `user_id`로 사용자 조회 → 200 + `UserOut` 또는 401 |


### 요청 본문 요약

- **register**: `username` (3~20자, 영문·숫자·`_`), `email`, `password` (8자 이상)
- **login**: `username`과 `password`만 사용.

### 응답 `UserOut`

```json
{
  "id": "<MongoDB ObjectId 문자열>",
  "username": "<아이디>",
  "email": "<이메일>"
}
```

`id`는 문서 `_id`이며, 세션에도 동일 문자열이 `user_id`로 저장된다. 구 계정에 `username`이 없으면 빈 문자열일 수 있다.

## 인증 흐름

1. `POST /auth/login` 성공 시 `request.session["user_id"]` 설정, 브라우저에 서명된 세션 쿠키 발급.
2. 이후 같은 사이트/출처에서 쿠키를내면 `GET /auth/me` 등에서 세션으로 사용자 식별.
3. 별도 프론트 도메인 사용 시 `CORS_ORIGINS`에 프론트 origin을 넣고, 클라이언트는 `credentials: 'include'` 필요.

## 실행

```bash
cd dementia
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

API 문서: `http://127.0.0.1:8000/docs`

## 의존성

`requirements.txt`: `fastapi`, `uvicorn[standard]`, `motor`, `passlib[bcrypt]`, `pydantic-settings`, `email-validator`
