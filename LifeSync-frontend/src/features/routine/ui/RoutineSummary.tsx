import { CheckCircle2, CircleDashed, Loader2 } from 'lucide-react'
import { SectionCard } from '@/shared/ui'
import { useTodayRoutines } from '../hooks'

export function RoutineSummary() {
  const {
    actionError,
    completedCount,
    error,
    isFallback,
    isLoading,
    items,
    togglingId,
    toggleRoutineCompletion,
  } = useTodayRoutines()

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="content-title">오늘의 추천 루틴</h2>
            {!isLoading && !isFallback ? (
              <p className="mt-2 text-base text-contentMid">
                {completedCount}개 완료 · 총 {items.length}개
              </p>
            ) : null}
          </div>
          <div className="rounded-full bg-primaryPale px-4 py-2 text-sm font-semibold text-primary">
            {isFallback ? '예시 루틴' : '연동 데이터'}
          </div>
        </div>
        {actionError ? (
          <p className="mt-4 text-base font-medium text-red-500">{actionError}</p>
        ) : null}
        {!isLoading && isFallback ? (
          <p className="mt-4 text-base text-contentLight">
            완료 체크는 로그인 후 서버 루틴이 불러와졌을 때 사용할 수 있습니다.
          </p>
        ) : null}
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const isToggling = togglingId === item.id

            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={isLoading || isToggling}
                  onClick={() => void toggleRoutineCompletion(item.id, item.completed)}
                  className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium transition-colors ${
                    item.completed
                      ? 'bg-success/10 text-teal ring-1 ring-success/30'
                      : 'bg-primaryPale text-teal hover:bg-primary/10'
                  } ${isLoading || isToggling ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
                  aria-pressed={item.completed}
                  aria-label={`${item.title} ${item.completed ? '완료 취소' : '완료로 표시'}`}
                >
                  {isToggling ? (
                    <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" />
                  ) : item.completed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" strokeWidth={2.2} />
                  ) : (
                    <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={2.2} />
                  )}
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span>{item.title}</span>
                    {item.recommendationReason ? (
                      <span className="text-sm font-normal leading-relaxed text-contentMid">
                        {item.recommendationReason}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </SectionCard>
    </div>
  )
}
