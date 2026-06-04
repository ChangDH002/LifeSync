import { TrainingHubSection } from '@/features/cognitive-training'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'

export function TrainingPage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <TrainingHubSection />
      <AppFooter />
    </main>
  )
}
