import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { MypageSummary } from '@/features/mypage'

export function MypagePage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="page-shell py-10 md:py-12">
        <MypageSummary />
      </div>
      <AppFooter />
    </main>
  )
}
