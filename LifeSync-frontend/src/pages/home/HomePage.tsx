import { ChatbotPreview } from '@/features/chatbot'
import { TrainingSummary } from '@/features/cognitive-training'
import { DementiaInfoPreview } from '@/features/dementia-info'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { Button, SectionCard } from '@/shared/ui'

export function HomePage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6">
        <SectionCard className="overflow-hidden bg-gradient-to-r from-primary to-success text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Senior Friendly Care
              </p>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                더 단순하고 또렷한 건강 관리 흐름으로 LifeSync를 시작하세요.
              </h1>
              <p className="text-lg text-white/90">
                중요한 기능을 홈에서 바로 찾고, 치매 정보와 인지 훈련, 챗봇 도움까지 한
                흐름으로 연결했습니다.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asLink to="/login">
                로그인
              </Button>
              <Button asLink to="/information" variant="secondary">
                정보 보기
              </Button>
            </div>
          </div>
        </SectionCard>
        <div className="grid gap-6 lg:grid-cols-2">
          <DementiaInfoPreview />
          <TrainingSummary />
        </div>
        <ChatbotPreview />
      </section>
      <AppFooter />
    </main>
  )
}
