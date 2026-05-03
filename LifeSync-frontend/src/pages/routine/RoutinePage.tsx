import { RoutineSummary } from '@/features/routine'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'

export function RoutinePage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="page-shell py-12">
        <RoutineSummary />
      </div>
      <AppFooter />
    </main>
  )
}
