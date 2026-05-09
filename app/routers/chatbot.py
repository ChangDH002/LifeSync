from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.jwt import decode_access_token
from app.db import get_db
from app.repositories.chat_session import get_session, get_sessions_by_user
from app.schemas.chatbot import (
    AIChatRequest,
    AIChatResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSessionDetail,
    ChatSessionMessage,
    ChatSessionSummary,
    RetrievedContext,
)
from app.services import chatbot as chatbot_service
from app.services import gemini_service, sbert_retriever
from app.services.prompt_builder import (
    build_chat_prompt,
    build_context_string,
    extract_related_topics,
)
from app.services.gemini_service import SAFETY_NOTICE

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    try:
        return decode_access_token(credentials.credentials)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        ) from None


@router.post("/messages", response_model=ChatMessageResponse)
async def send_message(
    body: ChatMessageRequest,
    user_id: str = Depends(get_current_user_id),
) -> ChatMessageResponse:
    return await chatbot_service.process_message(user_id=user_id, req=body)


@router.get("/sessions", response_model=list[ChatSessionSummary])
async def list_sessions(
    user_id: str = Depends(get_current_user_id),
) -> list[ChatSessionSummary]:
    db = get_db()
    rows = await get_sessions_by_user(db, user_id=user_id)
    return [
        ChatSessionSummary(
            session_id=r["session_id"],
            title=r.get("title", ""),
            updated_at=r.get("updated_at", ""),
            message_count=r.get("message_count", 0),
        )
        for r in rows
    ]


@router.post("/message", response_model=AIChatResponse)
async def ai_chat_message(body: AIChatRequest) -> AIChatResponse:
    retrieved = sbert_retriever.retrieve_context(body.message, top_k=3)
    context_str = build_context_string(retrieved)

    prompt = build_chat_prompt(
        message=body.message,
        persona=body.persona,
        risk_level=body.riskLevel,
        main_risk_factors=body.mainRiskFactors,
        recommendations=body.recommendations,
        context=context_str,
    )

    response_text, fallback_used = gemini_service.generate(prompt)
    related_topics = extract_related_topics(retrieved)

    return AIChatResponse(
        message=response_text,
        relatedTopics=related_topics,
        usedModel=gemini_service.get_model_name() if not fallback_used else "fallback",
        retrievedContexts=[
            RetrievedContext(
                question=r["question"],
                answer=r["answer"],
                category=r["category"],
                score=r["score"],
            )
            for r in retrieved
        ],
        fallbackUsed=fallback_used,
        safetyNotice=SAFETY_NOTICE,
    )


@router.get("/sessions/{session_id}", response_model=ChatSessionDetail)
async def get_session_detail(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
) -> ChatSessionDetail:
    db = get_db()
    doc = await get_session(db, session_id=session_id, user_id=user_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="세션을 찾을 수 없습니다.")
    return ChatSessionDetail(
        session_id=doc["session_id"],
        title=doc.get("title", ""),
        created_at=doc.get("created_at", ""),
        updated_at=doc.get("updated_at", ""),
        messages=[
            ChatSessionMessage(
                role=m["role"],
                content=m["content"],
                timestamp=m.get("timestamp", ""),
            )
            for m in doc.get("messages", [])
        ],
    )
