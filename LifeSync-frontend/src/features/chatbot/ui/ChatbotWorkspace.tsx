import { Bot, LoaderCircle, SendHorizonal, Sparkles, Stethoscope, UserRound } from 'lucide-react'
import { Button, SectionCard } from '@/shared/ui'
import { useChatbot } from '../hooks'

function MessageBubble({
  content,
  role,
}: {
  content: string
  role: 'user' | 'assistant' | 'system'
}) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primaryPale text-primary shadow-card">
          {role === 'assistant' ? <Bot className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </div>
      ) : null}

      <div
        className={
          isUser
            ? 'max-w-[85%] rounded-[24px] rounded-br-md bg-gradient-to-br from-primary to-teal px-5 py-4 text-base leading-8 text-white shadow-card md:max-w-[70%]'
            : 'max-w-[88%] rounded-[24px] rounded-bl-md border border-border bg-white/85 px-5 py-4 text-base leading-8 text-content shadow-card md:max-w-[72%]'
        }
      >
        {content}
      </div>

      {isUser ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tealDark text-white shadow-card">
          <UserRound className="h-5 w-5" />
        </div>
      ) : null}
    </div>
  )
}

export function ChatbotWorkspace() {
  const {
    applyStarterPrompt,
    canSend,
    error,
    handleSubmit,
    input,
    isSending,
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
  } = useChatbot()

  return (
    <section className="w-full">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard className="hero-surface w-full overflow-hidden rounded-[28px] border-primary/20 p-0 shadow-cardLg">
          <div className="border-b border-tealDark/10 px-5 py-5 md:px-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="section-badge">AI Chatbot</div>
                <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-tealDark md:text-[38px]">
                  인지 건강 AI 상담
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-8 text-contentMid md:text-lg">
                  생활 습관, 인지 건강 정보, 루틴 실천 방법을 차분하게 정리해드립니다.
                </p>
              </div>

              <div className="rounded-[22px] bg-white/78 px-4 py-3 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">세션 상태</p>
                <p className="mt-1 text-base font-bold text-tealDark">
                  {sessionId ? `연결됨 · ${sessionId.slice(0, 8)}…` : '새 대화 시작 전'}
                </p>
                <p className="mt-1 text-sm text-contentMid">{messageCountLabel}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-4 py-4 md:px-6 md:py-6">
            <div className="rounded-[28px] border border-white/60 bg-white/72 p-4 shadow-card md:p-5">
              <div className="mb-4 flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    className="rounded-full border border-primary/20 bg-primaryPale/80 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primaryPale"
                    key={prompt}
                    onClick={() => void applyStarterPrompt(prompt)}
                    type="button"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="flex min-h-[420px] flex-col gap-4 rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.74)_0%,rgba(235,245,239,0.86)_100%)] p-4 md:min-h-[520px] md:p-5">
                {messages.map((message) => (
                  <MessageBubble content={message.content} key={message.id} role={message.role} />
                ))}

                {isSending ? (
                  <div className="flex items-center gap-3 rounded-[20px] border border-border bg-white/82 px-4 py-3 text-contentMid shadow-card">
                    <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                    응답을 받아오는 중입니다...
                  </div>
                ) : null}
              </div>
            </div>

            <SectionCard className="rounded-[28px] border-white/60 bg-white/82 p-4 shadow-card md:p-5">
              <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold tracking-[0.1em] text-primary">
                    질문 입력
                  </span>
                  <textarea
                    className="min-h-[120px] w-full resize-none rounded-[22px] border border-border bg-surface px-4 py-4 text-base leading-8 text-content placeholder:text-contentLight focus-visible:border-primary focus-visible:outline-none"
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="예: 기억력이 떨어지는 것 같을 때 생활 속에서 먼저 점검해볼 수 있는 습관을 알려줘"
                    value={input}
                  />
                </label>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm leading-7 text-contentMid">
                    의료 진단을 대신하지 않으며, 위험 신호가 있으면 반드시 전문의 상담이 필요합니다.
                  </p>
                  <Button className="min-h-[56px] rounded-[22px] px-6" disabled={!canSend} type="submit">
                    <SendHorizonal className="mr-2 h-5 w-5" />
                    질문 보내기
                  </Button>
                </div>

                {error ? <p className="text-sm font-medium text-[#B54708]">{error}</p> : null}
              </form>
            </SectionCard>
          </div>
        </SectionCard>

        {/* 사이드바 */}
        <div className="space-y-5">
          {/* 이전 대화 세션 목록 */}
          <SectionCard className="rounded-[28px] border-primary/15 bg-white/86 p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold tracking-[0.1em] text-primary">이전 대화</p>
              <button
                className="rounded-full border border-primary/20 bg-primaryPale/80 px-3 py-1 text-xs font-semibold text-primary hover:bg-primaryPale"
                onClick={startNewChat}
                type="button"
              >
                + 새 채팅
              </button>
            </div>

            {/* 세션 목록 스크롤 영역 */}
            <div className="max-h-[320px] overflow-y-auto pr-1">
              {sessionsLoading ? (
                <div className="flex items-center gap-2 text-sm text-contentMid">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  불러오는 중...
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-contentLight">저장된 대화가 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {sessions.map((s) => (
                    <li key={s.session_id}>
                      <button
                        className={`w-full rounded-[16px] border px-4 py-3 text-left text-sm transition-colors ${
                          sessionId === s.session_id
                            ? 'border-primary/30 bg-primaryPale text-primary'
                            : 'border-border bg-white/70 text-content hover:bg-primaryPale/50'
                        }`}
                        disabled={sessionOpeningId === s.session_id}
                        onClick={() => void openSession(s.session_id)}
                        type="button"
                      >
                        <div className="flex items-center gap-1.5">
                          {sessionOpeningId === s.session_id ? (
                            <LoaderCircle className="h-3 w-3 shrink-0 animate-spin" />
                          ) : null}
                          <p className="truncate font-medium">{s.title || '(제목 없음)'}</p>
                        </div>
                        <p className="mt-1 text-xs text-contentMid">
                          {s.message_count}개 메시지 · {s.updated_at.slice(0, 10)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>

          {/* 안내 카드 */}
          <SectionCard className="rounded-[28px] border-primary/15 bg-white/86 p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primaryPale text-primary">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.1em] text-primary">안내</p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-tealDark">
                  AI 상담 이용 안내
                </h2>
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-contentMid">
              <li>· 의료 진단을 대신하지 않습니다.</li>
              <li>· 위험 신호가 있으면 전문의 상담이 필요합니다.</li>
              <li>· 대화 내용은 자동으로 저장됩니다.</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </section>
  )
}
