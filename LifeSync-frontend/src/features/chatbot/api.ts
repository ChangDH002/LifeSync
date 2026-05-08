/**
 * 챗봇 도메인 API
 * 챗봇 기능 관리
 */
import apiClient from '@/shared/api/client'
import type {
  ChatSessionDetail,
  ChatSessionSummary,
  ChatbotSendMessageRequest,
  ChatbotSendMessageResponse,
} from './types'

export const chatbotApi = {
  sendMessage(payload: ChatbotSendMessageRequest) {
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
