/**
 * 챗봇 도메인 타입
 */

export type ChatMessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  timestamp: string
}

export interface ChatbotSession {
  id: string
  title?: string
}

export interface ChatSessionSummary {
  session_id: string
  title: string
  message_count: number
  updated_at: string
}

export interface ChatSessionDetailMessage {
  role: ChatMessageRole | string
  content: string
  timestamp: string
}

export interface ChatSessionDetail {
  session_id: string
  title: string
  messages: ChatSessionDetailMessage[]
}

export interface ChatbotSendMessageRequest {
  sessionId?: string
  message: string
  history: Array<Pick<ChatMessage, 'role' | 'content'>>
}

export interface ChatbotSendMessageResponse {
  sessionId: string
  answer: string
  sources?: Array<{
    title: string
    url?: string
  }>
}

// ── AI 챗봇 메시지 (POST /chatbot/message) ───────────────────────

export interface AIChatRequest {
  message: string
  persona?: string
  riskLevel?: string
  mainRiskFactors?: string[]
  recommendations?: string[]
}

export interface AIChatResponse {
  message: string
  relatedTopics: string[]
  usedModel: string
  fallbackUsed: boolean
  safetyNotice: string
}
