import { DementiaInfoSlider } from '@/features/dementia-info'
import { DailyTip } from '@/features/dementia-info/ui/DailyTip'
import { InfoActionBanner } from '@/features/dementia-info/ui/InfoActionBanner'
import { InfoFAQ } from '@/features/dementia-info/ui/InfoFAQ'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'

export function InformationPage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      
      <div className="page-shell flex flex-col gap-6 py-12">
        <DailyTip />
        <DementiaInfoSlider />
        <InfoFAQ />
        <InfoActionBanner />
      </div>

      <AppFooter />
    </main>
  )
}
