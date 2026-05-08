from pydantic import BaseModel


class HistoryItem(BaseModel):
    role: str
    content: str


class ChatMessageRequest(BaseModel):
    sessionId: str | None = None
    message: str
    history: list[HistoryItem] = []


class Source(BaseModel):
    title: str
    url: str


class ChatMessageResponse(BaseModel):
    sessionId: str
    answer: str
    sources: list[Source] = []


# ── 세션 목록 / 상세 ────────────────────────────────────────────

class ChatSessionSummary(BaseModel):
    session_id: str
    title: str
    updated_at: str
    message_count: int = 0


class ChatSessionMessage(BaseModel):
    role: str
    content: str
    timestamp: str


class ChatSessionDetail(BaseModel):
    session_id: str
    title: str
    created_at: str
    updated_at: str
    messages: list[ChatSessionMessage] = []
