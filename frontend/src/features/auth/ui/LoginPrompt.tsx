import { FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '@/shared/api'
import { ROUTE_PATHS } from '@/shared/config'
import { useAuth } from '../hooks'
import { authApi } from '../api'
import { Button } from '@/shared/ui'
import { AuthFormCard } from './AuthFormCard'
import { SocialAuthButtons } from './SocialAuthButtons'

export function LoginPrompt() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    ROUTE_PATHS.mypage

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const session = await authApi.login({
        email: email.trim(),
        password,
      })

      setSession(session)
      navigate(redirectPath, { replace: true })
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, '로그인에 실패했습니다. 입력 정보를 다시 확인해 주세요.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormCard
      badge="Account"
      description="이메일이나 SNS 계정으로 간편하게 로그인하여 인지 건강 관리를 시작하세요."// 큰 글씨와 또렷한 버튼, 단순한 입력 흐름을 기본으로 한 로그인 진입 화면입니다.
      footerLinkLabel="회원가입하기"
      footerLinkTo={ROUTE_PATHS.signup}
      footerPrompt="처음 오셨나요?"
      title="편안하게 로그인하세요."
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-base font-medium text-contentMid">이메일</span>
          <input
            className="input-base"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@lifesync.kr"
            type="email"
            value={email}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-base font-medium text-contentMid">비밀번호</span>
          <input
            className="input-base"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            type="password"
            value={password}
          />
        </label>
        {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button className="px-8" disabled={isSubmitting} type="submit">
            {isSubmitting ? '로그인 중...' : '로그인'}
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
