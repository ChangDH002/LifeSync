import { Link } from 'react-router-dom'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { Button, SectionCard } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-3xl px-4 py-12 md:px-6">
        <SectionCard className="w-full text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">404</p>
          <h1 className="mt-4 text-3xl font-bold text-content">페이지를 찾을 수 없습니다.</h1>
          <p className="mt-3 text-lg text-content/80">
            주소가 바뀌었거나 잘못 입력되었을 수 있습니다. 홈으로 이동해 다시 찾아보세요.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asLink to="/">
              홈으로 이동
            </Button>
          </div>
          <p className="mt-4 text-sm text-content/60">
            또는{' '}
            <Link className="font-semibold text-primary underline" to="/login">
              로그인 페이지
            </Link>
            로 이동할 수 있습니다.
          </p>
        </SectionCard>
      </div>
      <AppFooter />
    </main>
  )
}
