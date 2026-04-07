import { Button, SectionCard } from '@/shared/ui'

export function DementiaInfoPreview() {
  return (
    <SectionCard>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Information</p>
      <h2 className="mt-4 text-2xl font-bold text-content">치매 정보를 쉬운 언어로 정리합니다.</h2>
      <p className="mt-3 text-lg leading-8 text-content/80">
        예방 습관, 초기 신호, 가족이 도울 수 있는 방법을 복잡한 설명 없이 빠르게 볼 수 있게
        구성합니다.
      </p>
      <Button asLink className="mt-6" to="/information" variant="secondary">
        자세히 보기
      </Button>
    </SectionCard>
  )
}
