import { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/shared/config'
import { Button } from '@/shared/ui'
import { useAuth } from '../hooks'
import { AuthFormCard } from './AuthFormCard'
import { SocialAuthButtons } from './SocialAuthButtons'

export function SignupPrompt() {
  const navigate = useNavigate()
  const { setSession } = useAuth()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSession({ accessToken: 'demo-signup-access-token' })
    navigate(ROUTE_PATHS.mypage)
  }

  return (
    <AuthFormCard
      badge="Sign Up"
      description="이메일 가입과 소셜 가입을 같은 흐름 안에서 제공하고, 나중에 백엔드 OAuth 연동으로 그대로 이어질 수 있도록 구성한 화면입니다."
      footerLinkLabel="로그인하기"
      footerLinkTo={ROUTE_PATHS.login}
      footerPrompt="이미 계정이 있으신가요?"
      title="편안하게 회원가입하세요."
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-base font-medium text-contentMid">이름</span>
          <input className="input-base" placeholder="이름을 입력하세요" type="text" />
        </label>
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
            이메일로 회원가입
          </Button>
          <Button asLink className="px-8" to={ROUTE_PATHS.home} variant="secondary">
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
        <SocialAuthButtons mode="signup" />
      </div>
    </AuthFormCard>
  )
}
