import { BookOpen, Brain, Eye, Scale } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useViewportMode } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { SectionCard } from '@/shared/ui'
import { TrainingSummary } from './TrainingSummary'

const trainingMenus = [
  {
    id: 'memory',
    title: '기억력 훈련',
    description: '카드 짝 맞추기',
    path: '/training/memory',
    color: 'bg-blue-500',
    icon: Brain,
  },
  {
    id: 'judgment',
    title: '판단력 훈련',
    description: '상황 판단 퀴즈',
    path: '/training/judgment',
    color: 'bg-green-500',
    icon: Scale,
  },
  {
    id: 'attention',
    title: '집중력 훈련',
    description: '순서 따라가기',
    path: '/training/attention',
    color: 'bg-orange-500',
    icon: Eye,
  },
  {
    id: 'language',
    title: '언어·인지 훈련',
    description: '단어 완성하기',
    path: '/training/language',
    color: 'bg-violet-500',
    icon: BookOpen,
  },
] as const

export function TrainingHubSection() {
  const navigate = useNavigate()
  const { isMobile, isWeb } = useViewportMode()

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-5xl flex-col',
        isMobile ? 'gap-6 px-4 py-8' : isWeb ? 'max-w-6xl gap-10 px-6 py-14' : 'gap-8 px-5 py-10'
      )}
    >
      <section>
        <h2 className={cn('font-bold text-gray-800', isMobile ? 'mb-4 text-xl' : 'mb-6 text-2xl')}>
          나의 훈련 현황
        </h2>
        <TrainingSummary />
      </section>

      <section
        className={cn(
          'grid grid-cols-1',
          isMobile ? 'gap-4' : isWeb ? 'gap-6 lg:grid-cols-4' : 'gap-5 md:grid-cols-2'
        )}
      >
        {trainingMenus.map((menu) => (
          <button
            key={menu.id}
            className={cn(
              'group relative overflow-hidden border-2 border-transparent bg-white shadow-md transition-all hover:border-primary hover:shadow-xl active:scale-95',
              isMobile ? 'rounded-[26px] p-6 text-left' : isWeb ? 'rounded-3xl p-8 text-left' : 'rounded-[28px] p-7 text-left'
            )}
            onClick={() => navigate(menu.path)}
            type="button"
          >
            <div className={cn(`mb-4 inline-flex items-center justify-center ${menu.color} text-white`, isMobile ? 'rounded-xl p-3' : 'rounded-2xl p-4')}>
              <menu.icon className={cn(isMobile ? 'h-7 w-7' : 'h-9 w-9')} strokeWidth={2.4} />
            </div>
            <h3 className={cn('font-black text-gray-900', isMobile ? 'text-xl' : 'text-2xl')}>{menu.title}</h3>
            <p className={cn('mt-2 font-medium text-gray-500', isMobile ? 'text-base leading-7' : 'text-lg')}>
              {menu.description}
            </p>

            <div className={cn('flex items-center font-bold text-primary', isMobile ? 'mt-4 text-base' : 'mt-6')}>
              <span>시작하기</span>
              <span className="ml-2 transition-transform group-hover:translate-x-2">→</span>
            </div>
          </button>
        ))}
      </section>

      <SectionCard className={cn('border-primary/20 bg-primaryPale/35', isWeb ? 'px-8 py-8' : '')}>
        <h2 className="content-title">훈련 안내</h2>
        <p className={cn('content-body mt-4', isMobile ? 'text-base leading-7' : '')}>
          게임별로 다른 인지 자극을 제공하므로, 하루에 하나씩 천천히 진행해도 충분합니다.
          정답보다 꾸준함을 먼저 목표로 삼아보세요.
        </p>
      </SectionCard>
    </div>
  )
}
