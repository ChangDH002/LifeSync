import { SectionCard } from '@/shared/ui'

const trainingPrograms = [
  '기억력: 하루 5분 회상 퀴즈',
  '집중력: 화면 따라가기 훈련',
  '판단력: 상황 선택 퀴즈',
] as const

export function TrainingSummary() {
  return (
    <SectionCard className="w-full">
      <div className="section-badge">Training</div>
      <h2 className="content-title mt-4">
        인지 훈련을 한 화면에서 이어갑니다.
      </h2>
      <ul className="mt-5 space-y-3 text-base leading-8 text-contentMid">
        {trainingPrograms.map((program) => (
          <li key={program} className="rounded-2xl bg-primaryPale px-4 py-3 text-base font-medium text-teal">
            {program}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
