from datetime import datetime, timezone
from uuid import uuid4

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.db import get_db
from app.repositories.chat_session import upsert_session
from app.schemas.chatbot import ChatMessageRequest, ChatMessageResponse, Source


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def process_message(user_id: str, req: ChatMessageRequest) -> ChatMessageResponse:
    session_id = req.sessionId or str(uuid4())
    user_message = req.message
    now = _now_iso()

    db = get_db()

    # 1. 사용자 메시지 저장 (새 세션이면 제목도 설정)
    title = user_message[:40]
    await upsert_session(
        db,
        session_id=session_id,
        user_id=user_id,
        new_messages=[{"role": "user", "content": user_message, "timestamp": now}],
        title=title,
    )

    # 2. AI 챗봇 서버 호출
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{settings.ai_chatbot_url}/chat",
                json={"message": user_message},
                timeout=15.0,
            )
            res.raise_for_status()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI 챗봇 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
        ) from None
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="AI 챗봇 서버 응답 시간이 초과되었습니다.",
        ) from None
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI 챗봇 서버 오류: {exc.response.status_code}",
        ) from None

    data = res.json()
    answer = data.get("answer", "")

    # 3. AI 응답 저장
    try:
        await upsert_session(
            db,
            session_id=session_id,
            user_id=user_id,
            new_messages=[{"role": "assistant", "content": answer, "timestamp": _now_iso()}],
        )
    except Exception:
        pass  # AI 응답 저장 실패는 무시 (이미 사용자 메시지는 저장됨)

    sources: list[Source] = []
    category = data.get("category", "")
    if category:
        sources = [Source(title=category, url="")]

    return ChatMessageResponse(
        sessionId=session_id,
        answer=answer,
        sources=sources,
    )
