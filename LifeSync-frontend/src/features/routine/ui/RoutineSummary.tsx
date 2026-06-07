import { CheckCircle2, CircleDashed, Loader2 } from 'lucide-react'
import { SectionCard } from '@/shared/ui'
import { useTodayRoutines } from '../hooks'

export function RoutineSummary() {
  const {
    actionError,
    canToggle,
    completedCount,
    items,
    isLoading,
    isFallback,
    error,
    toggleRoutineCompletion,
    togglingId,
  } = useTodayRoutines()

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <div className="section-badge">Routine</div>
        <h1 className="section-title mt-4">라이프 싱크 루틴</h1>
        <p className="section-subtitle mt-3">
          오늘의 생활 흐름을 다시 맞추기 위한 추천 루틴을 확인하고, 무리 없이 이어갈 수
          있도록 돕는 페이지입니다.
        </p>
        {isLoading ? <p className="mt-4 text-base text-contentLight">오늘의 루틴을 불러오는 중입니다.</p> : null}
        {!isLoading && (isFallback || error) ? (
          <p className="mt-4 text-base text-contentLight">{error}</p>
        ) : null}
      </SectionCard>
      <SectionCard>
        <div className="flex items-center justify-between gap-4">
          <h2 className="content-title">오늘의 싱크 회복 루틴</h2>
          <div className="rounded-full bg-primaryPale px-4 py-2 text-sm font-semibold text-primary">
            {isFallback ? '예시 루틴' : `${completedCount}/${items.length} 완료`}
          </div>
        </div>
        {isFallback ? (
          <p className="mt-4 text-sm text-contentLight">
            API가 연결되면 루틴 완료 체크가 저장됩니다.
          </p>
        ) : null}
        {actionError ? <p className="mt-4 text-sm text-red-600">{actionError}</p> : null}
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const isToggling = togglingId === item.id

            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={item.completed}
                  aria-label={
                    item.completed
                      ? `${item.title} 완료 취소`
                      : `${item.title} 완료로 표시`
                  }
                  className="flex w-full items-center gap-3 rounded-2xl bg-primaryPale px-4 py-3 text-left text-base font-medium text-teal transition hover:bg-primaryPale/80 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canToggle || isToggling}
                  onClick={() => void toggleRoutineCompletion(item.id)}
                >
                  {isToggling ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" strokeWidth={2.2} />
                  ) : item.completed ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" strokeWidth={2.2} />
                  ) : (
                    <CircleDashed className="h-5 w-5 shrink-0 text-primary" strokeWidth={2.2} />
                  )}
                  <span className={item.completed ? 'text-contentMid line-through' : undefined}>
                    {item.title}
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
