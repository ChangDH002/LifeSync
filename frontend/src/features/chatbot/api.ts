/**
 * 챗봇 도메인 API
 * 챗봇 기능 관리
 */
import apiClient from '@/shared/api/client'
import type {
  AIChatRequest,
  AIChatResponse,
  ChatSessionDetail,
  ChatSessionSummary,
  ChatbotSendMessageRequest,
  ChatbotSendMessageResponse,
} from './types'

export const chatbotApi = {
  sendMessage(payload: AIChatRequest) {
    return apiClient.post<never, AIChatResponse>('/chatbot/message', payload, {
      timeout: 45000,
    })
  },

  /** @deprecated 기존 세션 저장 방식 — 내부 사용 보존 */
  sendMessageLegacy(payload: ChatbotSendMessageRequest) {
    return apiClient.post<never, ChatbotSendMessageResponse>('/chatbot/messages', payload, {
      timeout: 45000,
    })
  },

  listSessions() {
    return apiClient.get<never, ChatSessionSummary[]>('/chatbot/sessions')
  },

  getSession(sessionId: string) {
    return apiClient.get<never, ChatSessionDetail>(`/chatbot/sessions/${sessionId}`)
  },
}
