import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '@/shared/api'
import { ROUTE_PATHS } from '@/shared/config'
import { Button } from '@/shared/ui'
import { useAuth } from '../hooks'
import { authApi } from '../api'
import { AuthFormCard } from './AuthFormCard'
import { SocialAuthButtons } from './SocialAuthButtons'

export function SignupPrompt() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !email.trim() || !password) {
      setError('이름, 이메일, 비밀번호를 모두 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const session = await authApi.signup({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      setSession(session)
      navigate(ROUTE_PATHS.mypage)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, '회원가입에 실패했습니다. 입력 정보를 다시 확인해 주세요.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormCard
      badge="Sign Up"
      description="복잡한 절차 없이 이메일이나 평소 쓰시는 SNS 계정으로 쉽고 빠르게 연결할 수 있습니다."//이메일 가입과 소셜 가입을 같은 흐름 안에서 제공하고, 나중에 백엔드 OAuth 연동으로 그대로 이어질 수 있도록 구성한 화면입니다.
      footerLinkLabel="로그인하기"
      footerLinkTo={ROUTE_PATHS.login}
      footerPrompt="이미 계정이 있으신가요?"
      title="편안하게 회원가입하세요."
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-base font-medium text-contentMid">이름</span>
          <input
            className="input-base"
            onChange={(event) => setName(event.target.value)}
            placeholder="이름을 입력하세요"
            type="text"
            value={name}
          />
        </label>
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
            {isSubmitting ? '가입 처리 중...' : '이메일로 회원가입'}
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
