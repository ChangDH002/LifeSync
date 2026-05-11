/**
 * 챗봇 도메인 Hook
 */
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/features/auth'
import { getApiErrorMessage } from '@/shared/api'

import { chatbotApi } from './api'
import type { ChatMessage, ChatMessageRole, ChatSessionSummary } from './types'

const starterMessages: ChatMessage[] = [
  {
    id: 'system-welcome',
    role: 'assistant',
    content:
      '안녕하세요. 생활 습관, 인지 건강 정보, 루틴 실천 방법을 차분하게 정리해드릴게요. 불편한 증상이 있거나 응급 상황이라면 의료기관에 바로 문의해 주세요.',
    timestamp: new Date().toISOString(),
  },
]

const starterPrompts = [
  '인지 건강을 위해 오늘 바로 실천할 수 있는 습관을 알려줘',
  '가족이 기억력 저하를 걱정할 때 어떻게 대화하면 좋을까?',
  '수면과 운동이 인지 건강에 어떤 도움을 주는지 정리해줘',
]

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  }
}

function normalizeRole(role: string): ChatMessageRole {
  if (role === 'user' || role === 'assistant' || role === 'system') return role
  return 'assistant'
}

export const useChatbot = () => {
  const { isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages)
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionOpeningId, setSessionOpeningId] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    if (!isAuthenticated) return
    setSessionsLoading(true)
    try {
      const list = await chatbotApi.listSessions()
      setSessions(list)
    } catch {
      console.warn('세션 목록을 불러오지 못했습니다.')
      setSessions([])
    } finally {
      setSessionsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void loadSessions()
  }, [loadSessions])

  const canSend = input.trim().length > 0 && !isSending

  const sendMessage = async (messageText: string) => {
    const trimmedMessage = messageText.trim()
    if (!trimmedMessage || isSending) return

    const userMessage = createMessage('user', trimmedMessage)
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setIsSending(true)
    setError(null)

    try {
      const response = await chatbotApi.sendMessage({
        message: trimmedMessage,
        persona: '생활습관 불균형형',
        riskLevel: 'medium',
        mainRiskFactors: [],
        recommendations: [],
      })

      setMessages((prev) => [...prev, createMessage('assistant', response.message)])
      await loadSessions()
    } catch (sendError) {
      console.error(sendError)
      setError(getApiErrorMessage(sendError, '아직 답변을 불러오지 못했습니다. 백엔드·AI 챗봇(8001) 상태를 확인한 뒤 다시 시도해 주세요.'))
      setMessages((prev) => [
        ...prev,
        createMessage('assistant', '현재 서버 응답을 받지 못했어요. 잠시 후 다시 시도하거나, 백엔드 챗봇 연결 상태를 확인해 주세요.'),
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    await sendMessage(input)
  }

  const applyStarterPrompt = async (prompt: string) => {
    setInput(prompt)
    await sendMessage(prompt)
  }

  const openSession = async (sid: string) => {
    setSessionOpeningId(sid)
    setError(null)
    try {
      const detail = await chatbotApi.getSession(sid)
      setSessionId(detail.session_id)
      const loaded: ChatMessage[] = detail.messages.map((m: { role: string; content: string; timestamp: string }, i: number) => ({
        id: `loaded-${detail.session_id}-${i}-${m.timestamp}`,
        role: normalizeRole(m.role),
        content: m.content,
        timestamp: m.timestamp || new Date().toISOString(),
      }))
      setMessages([...starterMessages, ...loaded])
    } catch {
      setError('이전 대화를 불러오지 못했습니다.')
    } finally {
      setSessionOpeningId(null)
    }
  }

  const startNewChat = () => {
    setSessionId(undefined)
    setMessages(starterMessages)
    setError(null)
  }

  const messageCountLabel = useMemo(
    () => `${Math.max(messages.length - 1, 0)}개의 대화`,
    [messages.length],
  )

  return {
    applyStarterPrompt,
    canSend,
    error,
    handleSubmit,
    input,
    isSending,
    loadSessions,
    messageCountLabel,
    messages,
    openSession,
    sessionId,
    sessionOpeningId,
    sessions,
    sessionsLoading,
    setInput,
    startNewChat,
    starterPrompts,
  }
}
