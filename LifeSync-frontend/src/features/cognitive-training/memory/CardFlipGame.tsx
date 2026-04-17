import { GameLayout } from '../ui/GameLayout'
import { useCognitiveTraining } from '../memory/hooks'
import { useViewportMode } from '@/shared/hooks'
import { cn } from '@/shared/lib'

export function CardFlipGame() {
  const { cards, flipCard, isGameOver, isTimeOver, resetGame, timeLeft } = useCognitiveTraining()
  const { isMobile, isWeb } = useViewportMode()
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return (
    <GameLayout title="하루 5분 회상 퀴즈" description="똑같은 그림 카드 2장을 찾아 기억력을 천천히 깨워보세요.">
      <div className="text-center">
        <p className={cn('mb-10 font-bold text-contentMid leading-relaxed', isMobile ? 'text-lg' : 'text-22px')}>
          {isGameOver ? (
            <span className="text-primary">축하합니다! 모든 카드를 찾았어요!</span>
          ) : isTimeOver ? (
            <span className="text-danger">시간이 종료되었어요. 다시 한 번 도전해보세요!</span>
          ) : (
            <>똑같은 그림이 그려진 <br /> 카드 2장을 찾아보세요!</>
          )}
        </p>

        <div className={cn('grid', isMobile ? 'grid-cols-3 gap-3' : isWeb ? 'grid-cols-4 gap-6' : 'grid-cols-3 gap-5')}>
          {cards.map((card) => (
            <button
              key={card.id}
              aria-label={card.isFlipped || card.isMatched ? `카드 ${card.content}` : '뒤집힌 카드'}
              className={`
                relative flex items-center justify-center overflow-hidden rounded-3xl transition-all active:scale-95
                ${card.isFlipped || card.isMatched 
                  ? 'bg-primaryPale border-4 border-primary shadow-none' 
                  : 'bg-surface border-2 border-border shadow-soft'}
                ${isMobile ? 'h-24' : isWeb ? 'h-32' : 'h-28'}
              `}
              onClick={() => flipCard(card.id)}
              type="button"
            >
              {(card.isFlipped || card.isMatched) && (
                <div className="absolute inset-0 rounded-3xl border-4 border-transparent bg-gradient-to-br from-primary to-teal opacity-20" />
              )}

              <span
                className={`absolute inset-0 flex items-center justify-center text-5xl leading-none transition-opacity duration-300 ${
                  card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'
                } ${isMobile ? 'text-3xl' : isWeb ? 'text-4xl' : 'text-4xl'}`}
              >
                {card.content}
              </span>

              <span
                aria-hidden={card.isFlipped || card.isMatched}
                className={`absolute inset-0 flex items-center justify-center text-4xl font-bold leading-none text-border transition-opacity duration-300 ${
                  card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'
                } ${isMobile ? 'text-3xl' : 'text-4xl'}`}
              >
                ?
              </span>
            </button>
          ))}
        </div>

        <div className={cn('flex flex-col items-center', isMobile ? 'mt-8 gap-4' : 'mt-12 gap-6')}>
          {isGameOver || isTimeOver ? (
            <button
              className={cn(
                'rounded-2xl bg-gradient-to-r from-primary to-teal font-bold text-white shadow-md transition-transform active:scale-95',
                isMobile ? 'px-8 py-4 text-lg' : 'px-12 py-5 text-22px'
              )}
              onClick={resetGame}
              type="button"
            >
              한 번 더 하기
            </button>
          ) : (
            <div className={cn('w-full rounded-2xl bg-primaryPale', isMobile ? 'py-4' : 'py-6')}>
              <p className={cn('font-extrabold text-tealDark', isMobile ? 'text-lg' : 'text-20px')}>
                남은 시간: <span className="font-mono">{minutes}:{seconds}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  )
}
