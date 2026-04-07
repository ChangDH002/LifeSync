import { SectionCard } from '@/shared/ui'

export function MypageSummary() {
  return (
    <SectionCard className="w-full">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">My Page</p>
      <h1 className="mt-4 text-3xl font-bold text-content">사용자 정보와 활동 내역</h1>
      <p className="mt-3 text-lg leading-8 text-content/80">
        출석, 최근 활동, 진행 중인 훈련 현황을 한눈에 보이는 카드 단위로 구성할 수 있는
        페이지입니다.
      </p>
    </SectionCard>
  )
}
