import { Button, SectionCard } from '@/shared/ui'

export function LoginPrompt() {
  return (
    <SectionCard className="w-full max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Account</p>
      <h1 className="mt-4 text-3xl font-bold text-content">편안하게 로그인하세요.</h1>
      <p className="mt-3 text-lg leading-8 text-content/80">
        큰 글씨와 또렷한 버튼, 단순한 입력 흐름을 기본으로 한 로그인 진입 화면입니다.
      </p>
      <form className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-base font-medium text-content">이메일</span>
          <input className="input-base" placeholder="example@lifesync.kr" type="email" />
        </label>
        <label className="block">
          <span className="mb-2 block text-base font-medium text-content">비밀번호</span>
          <input className="input-base" placeholder="비밀번호를 입력하세요" type="password" />
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit">로그인</Button>
          <Button asLink to="/" variant="secondary">
            홈으로
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}
