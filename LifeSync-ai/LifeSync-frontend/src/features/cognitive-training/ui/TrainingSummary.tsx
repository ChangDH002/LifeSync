import { useNavigate } from 'react-router-dom'
import { SectionCard } from '@/shared/ui'

const trainingPrograms = [
  {category: '기억력', description: '카드 뒤집기', color: 'text-teal', path: '/training/memory'},
  {category: '집중력', description: '화면 따라가기 훈련', color: 'text-primary', path: '/training/attention'},
  {category: '판단력', description: '상황 선택 퀴즈', color: 'text-secondary', path: '/training/judgment'},
  // '기억력: 하루 5분 회상 퀴즈',
  // '집중력: 화면 따라가기 훈련',
  // '판단력: 상황 선택 퀴즈',
] as const

export function TrainingSummary() {
  const navigate = useNavigate();

  return (
    <SectionCard className="w-full bg-surface shadow-soft border-border">
      <div className="section-badge text-18px">인지 훈련</div>
      <h2 className="text-28px font-extrabold text-tealDark mt-4 leading-tight">
        인지 훈련을 한 화면에서 이어갑니다.
      </h2>
      {/* <ul className="mt-5 space-y-3 text-base leading-8 text-contentMid"> */}
      <ul className="mt-8 space-y-5">
        {trainingPrograms.map((program) => (
          // <li key={program.category} className="rounded-2xl bg-primaryPale px-4 py-3 text-base font-medium text-teal">
          <li 
          key={program.category} 
          onClick={() => navigate(program.path)}
          className="rounded-3xl bg-primaryPale px-8 py-6 flex justify-between items-center active:scale-[0.97] transition-all cursor-pointer border border-transparent hover:border-primary">
            <div className={'flex flex-col gap-1'}>
              <span className='text-18px text-contentMid font-medium'>
                {program.description}
              </span>
            </div>
          <span className="text-34px text-tealDark">→</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-18px text-contentMid text-center leading-[1.7]">
        "매일 10분 투자가 당신의 기억력을 지킵니다!"
      </p>
    </SectionCard>
  )
}
