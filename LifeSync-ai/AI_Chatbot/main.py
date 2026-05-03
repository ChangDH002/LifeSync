"""
AI Chatbot Server - FastAPI 기반 SBERT 챗봇/추천 서버

엔드포인트:
- GET  /          : 서버 상태
- GET  /health    : 모델/데이터 로드 상태
- POST /chat      : 챗봇 QA CSV 기반 응답
- POST /recommend : 추천 CSV 기반 추천
"""
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.chatbot_service import ChatbotService
from services.recommendation_service import RecommendationService

# ---------------------------------------------------------------------------
# 경로 / 상수
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models" / "sbert_model"

CHATBOT_CSV = DATA_DIR / "chatbot_qa_dataset_500_directionB.csv"
RECOMMENDATION_CSV = DATA_DIR / "recommendation_dataset_500_directionB.csv"

DEFAULT_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
THRESHOLD = 0.5

# ---------------------------------------------------------------------------
# 전역 서비스 핸들
# ---------------------------------------------------------------------------
chatbot_service: ChatbotService | None = None
recommendation_service: RecommendationService | None = None


def _resolve_model_path() -> str:
    """로컬 모델이 '완전'하면 사용, 아니면 기본 모델명(HF) 사용.

    SentenceTransformer는 로컬 디렉토리에서 최소한의 가중치 파일을 기대한다.
    (예: model.safetensors 또는 pytorch_model.bin)
    """
    if MODEL_DIR.exists():
        # transformers 스타일
        if (MODEL_DIR / "model.safetensors").exists() or (MODEL_DIR / "pytorch_model.bin").exists():
            return str(MODEL_DIR)
        # sentence-transformers 저장 구조(모듈 폴더 내부에 가중치 존재 가능)
        for p in MODEL_DIR.rglob("*"):
            if p.name in {"model.safetensors", "pytorch_model.bin"}:
                return str(MODEL_DIR)
    return DEFAULT_MODEL_NAME


@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작 시 모델 + CSV 2종 로드 및 임베딩 사전 계산."""
    global chatbot_service, recommendation_service

    model_path = _resolve_model_path()

    chatbot_service = ChatbotService(
        csv_path=CHATBOT_CSV,
        model_path=model_path,
        threshold=THRESHOLD,
    )
    chatbot_service.load()

    # 동일한 SBERT 모델 인스턴스를 재사용해서 메모리 절약
    recommendation_service = RecommendationService(
        csv_path=RECOMMENDATION_CSV,
        model_path=model_path,
        threshold=THRESHOLD,
        sbert_model=chatbot_service.model,
    )
    recommendation_service.load()

    yield


# ---------------------------------------------------------------------------
# FastAPI 앱 + CORS
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Chatbot Server",
    description="SBERT 기반 챗봇 / 추천 API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request 스키마
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str


class RecommendRequest(BaseModel):
    message: str


# ---------------------------------------------------------------------------
# 라우트
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "AI Chatbot Server",
        "version": "1.0.0",
        "endpoints": ["/", "/health", "/chat", "/recommend"],
    }


@app.get("/health")
def health():
    model_loaded = chatbot_service is not None and chatbot_service.model is not None
    chatbot_loaded = chatbot_service is not None and chatbot_service.data is not None
    rec_loaded = recommendation_service is not None and recommendation_service.data is not None
    return {
        "model_loaded": bool(model_loaded),
        "chatbot_data_loaded": bool(chatbot_loaded),
        "recommendation_data_loaded": bool(rec_loaded),
        "chatbot_question_count": int(len(chatbot_service.data)) if chatbot_loaded else 0,
        "recommendation_count": int(len(recommendation_service.data)) if rec_loaded else 0,
    }


@app.post("/chat")
def chat(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="message must not be empty")
    if chatbot_service is None:
        raise HTTPException(status_code=503, detail="chatbot service not ready")
    return chatbot_service.answer(req.message.strip())


@app.post("/recommend")
def recommend(req: RecommendRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="message must not be empty")
    if recommendation_service is None:
        raise HTTPException(status_code=503, detail="recommendation service not ready")
    return recommendation_service.recommend(req.message.strip())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
