import { CheckCircle2, CircleDashed } from 'lucide-react'
import { SectionCard } from '@/shared/ui'
import { useTodayRoutines } from '../hooks'

export function RoutineSummary() {
  const { items, isLoading, isFallback, error } = useTodayRoutines()

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <div className="section-badge">Routine</div>
        <h1 className="section-title mt-4">예방 루틴</h1>
        <p className="section-subtitle mt-3">
          생활습관 개선을 위한 오늘의 추천 루틴을 확인하고, 꾸준히 실천할 수 있도록
          돕는 페이지입니다.
        </p>
        {isLoading ? <p className="mt-4 text-base text-contentLight">오늘의 루틴을 불러오는 중입니다.</p> : null}
        {!isLoading && (isFallback || error) ? (
          <p className="mt-4 text-base text-contentLight">{error}</p>
        ) : null}
      </SectionCard>
      <SectionCard>
        <div className="flex items-center justify-between gap-4">
          <h2 className="content-title">오늘의 추천 루틴</h2>
          <div className="rounded-full bg-primaryPale px-4 py-2 text-sm font-semibold text-primary">
            {isFallback ? '예시 루틴' : '연동 데이터'}
          </div>
        </div>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-2xl bg-primaryPale px-4 py-3 text-base font-medium text-teal"
            >
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" strokeWidth={2.2} />
              ) : (
                <CircleDashed className="h-5 w-5 shrink-0 text-primary" strokeWidth={2.2} />
              )}
              <span>{item.title}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
