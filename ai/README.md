# LifeSync AI

LifeSync의 AI 기능을 담당하는 폴더입니다. SBERT(문장 임베딩) 기반 챗봇·추천 서버와,
AI 기능별 설계/실험 모듈로 구성됩니다.

## 폴더 구조

```text
ai/
├── AI_Chatbot/     # SBERT 기반 챗봇/추천 FastAPI 서버 (Render 배포 대상)
│   ├── main.py
│   ├── services/   # chatbot_service, recommendation_service
│   ├── models/     # SBERT 모델
│   ├── data/       # 챗봇 QA / 추천 데이터셋(CSV)
│   └── requirements.txt
└── feature/        # AI 기능별 설계·실험 모듈
    ├── ai-base/
    ├── ai-chatbot/
    ├── ai-recommendation/
    └── ai-survey/
```

> 참고: 챗봇/추천을 포함한 일부 AI 기능은 메인 백엔드(`../backend/app/services`의 `sbert_retriever`, `gemini_service`,
> `persona_service`, `recommendation_service` 등)에도 통합되어 있습니다. `AI_Chatbot`은 이를 분리한 독립 서버입니다.

## AI 챗봇 서버 실행

```bash
cd ai/AI_Chatbot
python -m venv .venv
.venv\Scripts\activate           # Windows (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload --port 8001   # http://127.0.0.1:8001
```

- 헬스 체크: `GET /health` — 모델/데이터 로드 상태
- 엔드포인트: `POST /chat`(챗봇 QA), `POST /recommend`(추천)
- 최초 실행 시 SBERT 모델 로딩으로 시간이 걸릴 수 있습니다.

## 핵심 기능

| 기능 | 설명 |
|------|------|
| 위험군 유형 분석 | 설문·생활습관 데이터로 운동 부족형, 인지활동 부족형 등 위험군 유형 분류 |
| 맞춤 루틴 추천 | 사용자 상태에 따라 운동·생활습관·인지활동 루틴 추천 |
| 챗봇 대화 | SBERT/Gemini 기반 결과 설명·루틴 안내·동기부여 |
| 성향 기반 활동 추천 | 사용자 성향·선호에 맞는 활동/콘텐츠 추천 |

## 기술 스택

- **AI**: SBERT(sentence-transformers), Google Gemini, scikit-learn, pandas, numpy
- **Server**: FastAPI, uvicorn
