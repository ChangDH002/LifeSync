import { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/shared/config'
import { useAuth } from '../hooks'
import { Button } from '@/shared/ui'
import { AuthFormCard } from './AuthFormCard'
import { SocialAuthButtons } from './SocialAuthButtons'

export function LoginPrompt() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()
  const redirectPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    ROUTE_PATHS.mypage

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSession({ accessToken: 'demo-access-token' })
    navigate(redirectPath, { replace: true })
  }

  return (
    <AuthFormCard
      badge="Account"
      description="큰 글씨와 또렷한 버튼, 단순한 입력 흐름을 기본으로 한 로그인 진입 화면입니다."
      footerLinkLabel="회원가입하기"
      footerLinkTo={ROUTE_PATHS.signup}
      footerPrompt="처음 오셨나요?"
      title="편안하게 로그인하세요."
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-base font-medium text-contentMid">이메일</span>
          <input className="input-base" placeholder="example@lifesync.kr" type="email" />
        </label>
        <label className="block">
          <span className="mb-2 block text-base font-medium text-contentMid">비밀번호</span>
          <input className="input-base" placeholder="비밀번호를 입력하세요" type="password" />
        </label>
        <div className="flex flex-wrap gap-3 pt-4">
          <Button className="px-8" type="submit">
            로그인
          </Button>
          <Button asLink className="px-8" to="/" variant="secondary">
            홈으로
          </Button>
        </div>
      </form>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-sm font-medium uppercase tracking-[0.12em] text-contentLight">또는</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <SocialAuthButtons mode="login" />
      </div>
    </AuthFormCard>
  )
}
