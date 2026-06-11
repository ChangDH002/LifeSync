from fastapi import APIRouter, Depends, HTTPException, status
from app.db import get_db
from app.repositories.chat_session import get_session, get_sessions_by_user
from app.core.dependencies import get_current_user_id
from app.schemas.chatbot import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSessionDetail,
    ChatSessionSummary,
)
from app.services import chatbot as chatbot_service

router = APIRouter()

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
