import { SectionCard } from '@/shared/ui'

const trainingPrograms = [
  '기억력: 하루 5분 회상 퀴즈',
  '집중력: 화면 따라가기 훈련',
  '판단력: 상황 선택 퀴즈',
] as const

export function TrainingSummary() {
  return (
    <SectionCard className="w-full">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Training</p>
      <h2 className="mt-4 text-2xl font-bold text-content">인지 훈련을 한 화면에서 이어갑니다.</h2>
      <ul className="mt-5 space-y-3 text-lg leading-8 text-content/80">
        {trainingPrograms.map((program) => (
          <li key={program} className="rounded-2xl bg-primary/5 px-4 py-3">
            {program}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
