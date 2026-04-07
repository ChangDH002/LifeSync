import { DementiaInfoPreview } from '@/features/dementia-info'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { SectionCard } from '@/shared/ui'

export function InformationPage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
        <SectionCard>
          <h1 className="text-3xl font-bold text-content">치매 정보</h1>
          <p className="mt-3 text-lg leading-8 text-content/80">
            꼭 필요한 정보만 우선 보여주고, 긴 문장보다 짧고 분명한 안내를 기본값으로
            구성하는 페이지입니다.
          </p>
        </SectionCard>
        <DementiaInfoPreview />
      </div>
      <AppFooter />
    </main>
  )
}
