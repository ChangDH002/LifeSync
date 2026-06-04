# LifeSync

> AI 기반 치매 예방 및 생활습관 관리 웹 애플리케이션

[![Deploy LifeSync Frontend to GitHub Pages](https://github.com/ChangDH002/LifeSync/actions/workflows/deploy.yml/badge.svg)](https://github.com/ChangDH002/LifeSync/actions/workflows/deploy.yml)

데모(GitHub Pages): **https://changdh002.github.io/LifeSync/**

---

## 1. 프로젝트 소개

**LifeSync**는 고령층 사용자의 인지 건강과 생활습관을 관리하도록 돕는 AI 기반 웹 애플리케이션입니다.
생활습관 설문으로 치매 위험군 유형을 분석하고, 그 결과에 맞춰 맞춤형 루틴·인지훈련 게임·AI 상담을 제공합니다.

## 2. 개발 배경

고령 인구가 늘어나면서 치매를 비롯한 인지 건강 관리의 중요성이 커지고 있습니다.
하지만 일상 속에서 인지 건강을 꾸준히 관리하고 생활습관을 개선할 수 있는 친숙한 도구는 부족합니다.
LifeSync는 **설문 → 위험군 분석 → 맞춤 루틴/인지훈련 → 활동 기록**으로 이어지는 흐름을 통해,
고령층이 어렵지 않게 인지 건강을 관리하고 생활습관을 개선하도록 돕는 것을 목표로 합니다.

## 3. 주요 기능

- **생활습관 설문** — 생활·인지·성향 데이터를 입력받아 치매 위험군 유형을 분석
- **치매 예방 정보 제공** — 치매 유형·특징·예방법 등 인지 건강 정보 페이지
- **AI 챗봇 상담** — SBERT/Gemini 기반 대화형 상담 및 안내
- **인지훈련 게임** — 기억력 / 판단력 / 주의력 / 언어 4종 게임과 결과 분석
- **루틴 관리** — 사용자 상태에 맞춘 생활·운동·인지 루틴 추천 및 완료 기록
- **마이페이지 / 활동 기록** — 활동 내역, 미션 달성(나무 키우기) 등 진행 상황 확인

## 4. 기술 스택

| 파트 | 기술 |
|------|------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand |
| Backend | FastAPI, MongoDB(Motor), JWT 인증, OAuth(Google/Kakao) |
| AI | SBERT(문장 임베딩) 기반 챗봇·추천, Google Gemini 연동 |
| Deployment | GitHub Pages (Frontend) + GitHub Actions, Render (Backend/AI) |

## 5. 폴더 구조

```text
LifeSync/
├── README.md
├── frontend/            # React + Vite 프론트엔드 (GitHub Pages 배포 대상)
├── backend/             # FastAPI 메인 백엔드 (인증, 설문, 루틴, 인지훈련 API)
│   ├── app/
│   ├── tests/
│   └── requirements.txt
├── ai/                  # AI 챗봇/추천 서비스 및 AI 기능 모듈
│   ├── AI_Chatbot/      # SBERT 기반 챗봇/추천 FastAPI 서버
│   └── feature/         # AI 기능별 설계/실험 모듈
├── docs/                # 제출용 문서 (실행/배포/기능명세/화면구성)
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Pages 배포 워크플로우
├── render.yaml          # Render 배포 설정 (백엔드/AI)
├── .env.example         # 백엔드 환경 변수 예시
└── .gitignore
```

각 폴더의 상세 설명은 해당 폴더의 `README.md`를 참고하세요:
[frontend/README.md](frontend/README.md) · [backend/README.md](backend/README.md) · [ai/README.md](ai/README.md) · [docs/README.md](docs/README.md)

## 6. 실행 방법

### Frontend

```bash
cd frontend
npm install
npm run dev     # 개발 서버 (http://localhost:5173/LifeSync/)
npm run build   # 프로덕션 빌드 → frontend/dist
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://127.0.0.1:8000  (API 문서: /docs)
```

> 로컬에서 챗봇까지 함께 띄우려면 **메인 백엔드(8000) + AI 챗봇(8001) + 프론트엔드(5173)** 3개를 실행합니다.
> 자세한 내용은 [docs/실행방법.md](docs/실행방법.md)를 참고하세요.

## 7. 환경 변수 설정

- 백엔드: 루트의 [.env.example](.env.example)를 복사해 `backend/.env`(또는 실행 위치의 `.env`)로 만들고 값을 채웁니다.
- 프론트엔드: [frontend/.env.example](frontend/.env.example)를 복사해 `frontend/.env`로 만듭니다.
- 실제 비밀키(MongoDB URI, `JWT_SECRET_KEY`, OAuth Secret, `GEMINI_API_KEY` 등)는 **절대 커밋하지 않습니다.** `.env` 파일은 `.gitignore`로 제외되어 있습니다.

## 8. 배포 방법

프론트엔드는 **GitHub Actions + GitHub Pages**로 배포됩니다.
`main` 브랜치에 푸시되면 `.github/workflows/deploy.yml`이 `frontend`를 빌드해 `frontend/dist`를 Pages에 배포합니다.

> ⚠️ GitHub 저장소 **Settings → Pages → Source**를 반드시 **"GitHub Actions"** 로 설정해야 합니다.
> "Deploy from a branch (main / root)" 설정은 루트 문서가 그대로 노출되어 README가 보이므로 사용하지 않습니다.
> 자세한 설정 절차는 [docs/배포방법.md](docs/배포방법.md)를 참고하세요.

## 9. 팀원 역할

| 이름 | 역할 | 담당 |
|------|------|------|
| (이름) | Frontend | 화면/라우팅/상태관리 |
| (이름) | Backend | API/DB/인증 |
| (이름) | AI | 챗봇/추천/모델 |
| (이름) | 기획/문서 | 기획·문서·발표 |

> 실제 팀 구성에 맞게 표를 채워주세요.

## 10. 주의사항

> **본 서비스는 의료적 진단을 제공하지 않으며, 치매 예방과 생활습관 관리를 돕는 보조 서비스입니다.**
> 건강에 관한 진단·치료는 반드시 전문 의료기관의 상담을 받으시기 바랍니다.
