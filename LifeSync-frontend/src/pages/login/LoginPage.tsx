import { LoginPrompt } from '@/features/auth'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'

export function LoginPage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-4xl px-4 py-10 md:px-6">
        <LoginPrompt />
      </div>
      <AppFooter />
    </main>
  )
}
