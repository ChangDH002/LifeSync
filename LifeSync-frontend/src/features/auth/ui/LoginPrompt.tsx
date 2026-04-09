import { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/shared/config'
import { useAuth } from '../hooks'
import { Button, SectionCard } from '@/shared/ui'

export function LoginPrompt() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const redirectPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    ROUTE_PATHS.mypage

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    login('demo-access-token')
    navigate(redirectPath, { replace: true })
  }

  return (
    <SectionCard className="w-full max-w-2xl rounded-[28px] px-8 py-10">
      <div className="mb-8 flex items-center gap-3 font-serif text-2xl font-black tracking-[-0.02em] text-tealDark">
        <span className="logo-mark">🌿</span>
        LifeSync
      </div>
      <div className="section-badge">Account</div>
      <h1 className="section-title mt-4">편안하게 로그인하세요.</h1>
      <p className="section-subtitle mt-3 max-w-[620px]">
        큰 글씨와 또렷한 버튼, 단순한 입력 흐름을 기본으로 한 로그인 진입 화면입니다.
      </p>
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
    </SectionCard>
  )
}
