/**
 * 챗봇 도메인 Hook
 */
import { FormEvent, useMemo, useState } from 'react'
import { chatbotApi } from './api'
import type { ChatMessage } from './types'

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

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages)
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSend = input.trim().length > 0 && !isSending

  const sendMessage = async (messageText: string) => {
    const trimmedMessage = messageText.trim()
    if (!trimmedMessage || isSending) {
      return
    }

    const userMessage = createMessage('user', trimmedMessage)
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setIsSending(true)
    setError(null)

    try {
      const response = await chatbotApi.sendMessage({
        sessionId,
        message: trimmedMessage,
        history: nextMessages.map(({ role, content }) => ({ role, content })),
      })

      setSessionId(response.sessionId)
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage('assistant', response.answer),
      ])
    } catch (sendError) {
      console.error(sendError)
      setError('아직 답변을 불러오지 못했습니다. 백엔드 연결 상태를 확인한 뒤 다시 시도해 주세요.')
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage(
          'assistant',
          '현재 서버 응답을 받지 못했어요. 잠시 후 다시 시도하거나, 백엔드 챗봇 연결 상태를 확인해 주세요.',
        ),
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

  const messageCountLabel = useMemo(() => `${Math.max(messages.length - 1, 0)}개의 대화`, [messages.length])

  return {
    canSend,
    error,
    handleSubmit,
    input,
    isSending,
    messageCountLabel,
    messages,
    sessionId,
    setInput,
    starterPrompts,
    applyStarterPrompt,
  }
}
