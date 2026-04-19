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
