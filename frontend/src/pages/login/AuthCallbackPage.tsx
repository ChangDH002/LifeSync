import { AuthCallbackHandler } from '@/features/auth'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'

export function AuthCallbackPage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="hero-surface">
        <div className="page-shell flex py-14 md:py-20">
          <AuthCallbackHandler />
        </div>
      </div>
      <AppFooter />
    </main>
  )
}
