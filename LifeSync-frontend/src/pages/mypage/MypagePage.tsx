import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { MypageSummary } from '@/features/mypage'

export function MypagePage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-5xl px-4 py-8 md:px-6">
        <MypageSummary />
      </div>
      <AppFooter />
    </main>
  )
}
