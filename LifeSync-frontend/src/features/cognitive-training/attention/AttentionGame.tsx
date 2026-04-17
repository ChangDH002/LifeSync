import { useViewportMode } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { useCognitiveTraining } from './hooks'

export function AttentionGame() {
  const { sequence, activeButton, isPlaying, handleButtonClick, start } = useCognitiveTraining()
  const { isMobile, isWeb } = useViewportMode()

  const buttons = [
    { id: 0, color: 'bg-red-500', activeColor: 'bg-red-300 shadow-[0_0_40px_rgba(239,68,68,0.8)]', label: '빨강' },
    { id: 1, color: 'bg-blue-500', activeColor: 'bg-blue-300 shadow-[0_0_40px_rgba(59,130,246,0.8)]', label: '파랑' },
    { id: 2, color: 'bg-yellow-400', activeColor: 'bg-yellow-200 shadow-[0_0_40px_rgba(250,204,21,0.8)]', label: '노랑' },
    { id: 3, color: 'bg-green-500', activeColor: 'bg-green-300 shadow-[0_0_40px_rgba(34,197,94,0.8)]', label: '초록' },
  ] as const

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col px-4',
        isMobile ? 'max-w-2xl gap-5 py-4' : isWeb ? 'max-w-4xl gap-8 py-8' : 'max-w-3xl gap-6 py-6'
      )}
    >
      <div className="text-center">
        {sequence.length === 0 ? (
          <button
            className={cn(
              'rounded-full bg-primary font-bold text-white shadow-xl transition-transform hover:scale-105 active:scale-95',
              isMobile ? 'px-8 py-4 text-xl' : 'px-12 py-6 text-3xl'
            )}
            onClick={start}
            type="button"
          >
            훈련 시작하기
          </button>
        ) : (
          <div className={cn('font-bold text-gray-700', isMobile ? 'text-lg' : 'text-2xl')}>
            {isPlaying ? "반짝이는 순서를 잘 기억하세요!" : "기억한 순서대로 누르세요!"}
            <div className="mt-2 text-primary">현재 단계: {sequence.length}</div>
          </div>
        )}
      </div>

      <div className={cn('grid grid-cols-2 aspect-square', isMobile ? 'gap-3' : isWeb ? 'mx-auto max-w-[720px] gap-6' : 'gap-5')}>
        {buttons.map((btn) => (
          <button
            key={btn.id}
            disabled={isPlaying || sequence.length === 0}
            className={`relative flex items-center justify-center rounded-3xl transition-all duration-200
              ${activeButton === btn.id ? btn.activeColor : `${btn.color} opacity-80`}
              ${isPlaying ? 'cursor-default' : 'cursor-pointer hover:opacity-100 active:scale-90'}
              ${isMobile ? 'min-h-[110px]' : isWeb ? 'min-h-[220px]' : 'min-h-[170px]'}
            `}
            onClick={() => handleButtonClick(btn.id)}
            type="button"
          >
            <span className={cn('font-black text-white/40', isMobile ? 'text-lg' : 'text-2xl')}>{btn.label}</span>
            
            {activeButton === btn.id && (
              <div className="absolute inset-0 rounded-3xl bg-white/30 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      <div
        className={cn(
          'rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-center',
          isMobile ? 'p-4' : isWeb ? 'mx-auto max-w-[720px] p-6' : 'p-5'
        )}
      >
        <p className={cn('font-medium text-gray-500', isMobile ? 'text-base leading-7' : 'text-lg')}>
          컴퓨터가 보여주는 빛의 순서를 똑같이 따라 누르면<br />
          주의 집중력과 기억력이 쑥쑥 올라갑니다!
        </p>
      </div>
    </div>
  )
}
