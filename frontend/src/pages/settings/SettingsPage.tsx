import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { SettingsSummary } from '@/features/settings'

export function SettingsPage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-5xl px-4 py-8 md:px-6">
        <SettingsSummary />
      </div>
      <AppFooter />
    </main>
  )
}
