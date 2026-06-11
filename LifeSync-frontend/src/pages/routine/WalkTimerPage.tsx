import { WalkTimer } from '@/features/routine/walk-timer'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'

export function WalkTimerPage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="page-shell py-12">
        <WalkTimer />
      </div>
      <AppFooter />
    </main>
  )
}