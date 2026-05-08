import { SectionCard } from '@/shared/ui'

export function AvatarSummary() {
  return (
    <SectionCard className="w-full">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Avatar</p>
      <h1 className="mt-4 text-3xl font-bold text-content">아바타와 꾸미기 공간</h1>
      <p className="mt-3 text-lg leading-8 text-content/80">
        상점, 현재 장착 상태를 나눠 보여주되 시각적 부담이 적은 카드 구조를 권장합니다.
      </p>
    </SectionCard>
  )
}
