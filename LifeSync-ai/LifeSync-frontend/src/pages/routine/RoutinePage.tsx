import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { SectionCard } from '@/shared/ui'

const routineItems = [
  '식사 후 10분 가벼운 걷기',
  '하루 한 번 가족 또는 지인과 대화하기',
  '취침 전 밝은 화면 줄이고 수면 준비하기',
] as const

export function RoutinePage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="page-shell flex flex-col gap-6 py-12">
        <SectionCard>
          <div className="section-badge">Routine</div>
          <h1 className="section-title mt-4">예방 루틴</h1>
          <p className="section-subtitle mt-3">
            생활습관 개선을 위한 오늘의 추천 루틴을 확인하고, 꾸준히 실천할 수 있도록
            돕는 페이지입니다.
          </p>
        </SectionCard>
        <SectionCard>
          <h2 className="content-title">오늘의 추천 루틴</h2>
          <ul className="mt-4 space-y-3">
            {routineItems.map((item) => (
              <li key={item} className="rounded-2xl bg-primaryPale px-4 py-3 text-base font-medium text-teal">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
      <AppFooter />
    </main>
  )
}
