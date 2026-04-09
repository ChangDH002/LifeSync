import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChatbotPreview } from '@/features/chatbot'
import { TrainingSummary } from '@/features/cognitive-training'
import { DementiaInfoPreview } from '@/features/dementia-info'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { Button, SectionCard } from '@/shared/ui'

const cognitiveHighlights = [
  {
    title: '수면과 기억 정리',
    body: '규칙적인 수면은 하루 동안 받은 정보를 정리하고 기억을 안정화하는 데 도움을 줍니다.',
    note: '오늘은 취침 1시간 전 밝은 화면을 줄여보세요.',
  },
  {
    title: '가벼운 걷기와 집중력',
    body: '짧은 걷기 습관은 뇌혈류를 돕고 기분을 안정시켜 집중력을 유지하는 데 유리합니다.',
    note: '식사 후 10분 산책부터 시작해도 충분합니다.',
  },
  {
    title: '대화와 인지 자극',
    body: '가족이나 지인과의 대화는 언어 자극과 정서적 안정에 모두 도움이 되는 활동입니다.',
    note: '하루 한 번 안부 전화를 목표로 잡아보세요.',
  },
] as const

export function HomePage() {
  const [highlightIndex, setHighlightIndex] = useState(0)
  const currentHighlight = cognitiveHighlights[highlightIndex]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHighlightIndex((currentIndex) =>
        currentIndex === cognitiveHighlights.length - 1 ? 0 : currentIndex + 1
      )
    }, 3500)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <section className="hero-surface">
        <div className="page-shell relative z-10 grid gap-14 py-24 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2 text-base font-semibold text-teal shadow-card">
              <span className="h-2 w-2 rounded-full bg-primary" />
              AI 기반 치매 예방 관리 서비스
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.2] tracking-[-0.03em] text-tealDark md:text-[50px]">
              더 편안하게,
              <br />
              <span className="text-primary">더 오래 선명하게</span>
              <br />
              일상을 관리하세요.
            </h1>
            <p className="mt-6 max-w-[580px] text-base leading-8 text-contentMid md:text-lg">
              HTML 시안의 분위기를 기반으로 전역 디자인을 재구성했습니다. 중요한 기능을
              한눈에 찾고, 치매 정보와 인지 훈련, 챗봇 도움을 자연스럽게 이어줍니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asLink className="px-8 py-4 text-lg" to="/login">
                시작하기
              </Button>
              <Button asLink className="px-8 py-4 text-lg" to="/information" variant="secondary">
                예방 정보 보기
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SectionCard className="min-h-[160px] p-5 md:col-span-2">
              <div className="mb-1 text-[28px]">🧠</div>
              <Link
                className="block transition-colors hover:text-inherit"
                to="/information"
              >
                <h3 className="content-title text-[24px]">오늘의 인지 건강</h3>
                <p className="content-note mt-0.5">인지 건강 정보를 가볍게 미리 확인할 수 있습니다.</p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-primary">
                  Highlight {highlightIndex + 1}
                </p>
                <h4 className="mt-1.5 text-[19px] font-bold tracking-[-0.02em] text-tealDark">
                  {currentHighlight.title}
                </h4>
                <p className="mt-1.5 text-[16px] leading-6 text-contentMid">{currentHighlight.body}</p>
                <p className="mt-1 text-[15px] leading-6 text-contentLight">{currentHighlight.note}</p>
                <p className="mt-2 text-[15px] font-semibold text-teal">인지 건강 페이지로 이동 →</p>
              </Link>
              <div className="mt-2 flex gap-2">
                {cognitiveHighlights.map((_, index) => (
                  <span
                    key={`highlight-dot-${index}`}
                    className={
                      index === highlightIndex
                        ? 'h-2.5 w-8 rounded-full bg-primary'
                        : 'h-2.5 w-2.5 rounded-full bg-primaryLight'
                    }
                  />
                ))}
              </div>
            </SectionCard>
            <Link className="block" to="/routine">
              <SectionCard className="min-h-[188px]">
                <div className="mb-3 text-3xl">🌿</div>
                <h3 className="content-title text-[24px]">예방 루틴</h3>
                <p className="content-note mt-2">하루 습관을 부드럽게 이어줍니다.</p>
              </SectionCard>
            </Link>
            <Link className="block" to="/chatbot">
              <SectionCard className="min-h-[188px]">
                <div className="mb-3 text-3xl">💬</div>
                <h3 className="content-title text-[24px]">AI 상담</h3>
                <p className="content-note mt-2">질문을 천천히 해도 괜찮습니다.</p>
              </SectionCard>
            </Link>
          </div>
        </div>
      </section>
      <section className="page-shell flex flex-col gap-8 py-16">
        <div>
          <div className="section-badge">핵심 기능</div>
          <h2 className="section-title mt-4">복잡하지 않게, 필요한 기능만 먼저</h2>
          <p className="section-subtitle mt-3 max-w-[760px]">
            카드와 여백, 둥근 모서리, 세리프 타이틀을 기준으로 전체 화면 밀도를 낮췄습니다.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <DementiaInfoPreview />
          <TrainingSummary />
          <ChatbotPreview />
        </div>
      </section>
      <AppFooter />
    </main>
  )
}
