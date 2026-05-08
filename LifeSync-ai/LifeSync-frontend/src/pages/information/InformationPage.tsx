import { DementiaInfoPreview } from '@/features/dementia-info'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { SectionCard } from '@/shared/ui'

export function InformationPage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="page-shell flex flex-col gap-6 py-12">
        <SectionCard>
          <div className="section-badge">예방 정보</div>
          <h1 className="section-title mt-4">인지 건강 정보</h1>
          <p className="section-subtitle mt-3">
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
