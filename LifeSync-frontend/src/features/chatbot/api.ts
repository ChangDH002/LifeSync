/**
 * 챗봇 도메인 API
 * 챗봇 기능 관리
 */
import apiClient from '@/shared/api/client'
import type { ChatbotSendMessageRequest, ChatbotSendMessageResponse } from './types'

export const chatbotApi = {
  sendMessage(payload: ChatbotSendMessageRequest) {
    return apiClient.post<never, ChatbotSendMessageResponse>('/chatbot/messages', payload)
  },
}
