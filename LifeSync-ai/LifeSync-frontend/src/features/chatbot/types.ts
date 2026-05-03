/**
 * 챗봇 도메인 타입
 */

export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: string
}
