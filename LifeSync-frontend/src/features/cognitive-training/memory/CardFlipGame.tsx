import { GameLayout } from '../ui/GameLayout'
import { useTrainingActivityReporter } from '../hooks'
import { useCognitiveTraining } from '../memory/hooks'
import { useViewportMode } from '@/shared/hooks'
import { cn } from '@/shared/lib'

export function CardFlipGame() {
  const {
    cards,
    feedback,
    flipCard,
    flippedCards,
    isGameOver,
    isPreviewing,
    isTimeOver,
    previewSecondsLeft,
    resetGame,
    timeLeft,
  } = useCognitiveTraining()
  const { isMobile, isWeb } = useViewportMode()
  const { reportParticipation } = useTrainingActivityReporter({
    gameCategory: 'memory',
    gameName: '카드 짝 맞추기',
  })
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
          ) : isPreviewing ? (
            <span className="text-tealDark">
              전체 카드를 {previewSecondsLeft}초 동안 보여드릴게요.
              <br />
              위치를 기억한 뒤 시작해보세요!
            </span>
          ) : feedback.type === 'match' ? (
            <span className="text-success">좋아요! 같은 카드 2장을 정확하게 찾았어요.</span>
          ) : feedback.type === 'mismatch' ? (
            <span className="text-danger">조금 달라요. 잠깐 기억했다가 다시 골라보세요.</span>
          ) : (
            <>똑같은 그림이 그려진 <br /> 카드 2장을 찾아보세요!</>
          )}
        </p>

        <div className={cn('grid', isMobile ? 'grid-cols-3 gap-3' : isWeb ? 'grid-cols-4 gap-6' : 'grid-cols-3 gap-5')}>
          {cards.map((card) => (
            (() => {
              const isSelected = flippedCards.includes(card.id)
              const isFeedbackCard = feedback.cardIds.includes(card.id)
              const isMatchFeedback = isFeedbackCard && feedback.type === 'match'
              const isMismatchFeedback = isFeedbackCard && feedback.type === 'mismatch'

              return (
                <button
                  key={card.id}
                  aria-label={card.isFlipped || card.isMatched ? `카드 ${card.content}` : '뒤집힌 카드'}
                  className={cn(
                    'relative flex items-center justify-center overflow-hidden rounded-3xl transition-all duration-200 active:scale-95',
                    card.isFlipped || card.isMatched
                      ? 'border-4 border-primary bg-primaryPale shadow-none'
                      : 'border-2 border-border bg-surface shadow-soft',
                    isSelected && !card.isMatched ? 'scale-[0.97] ring-4 ring-teal/15' : '',
                    isMatchFeedback ? 'ring-4 ring-success/25 shadow-[0_0_0_8px_rgba(74,103,65,0.12)]' : '',
                    isMismatchFeedback ? 'border-danger bg-[#FFF2F0] ring-4 ring-danger/15' : '',
                    isPreviewing ? 'cursor-default' : '',
                    isMobile ? 'h-24' : isWeb ? 'h-32' : 'h-28',
                  )}
                  onClick={() => {
                    void reportParticipation({
                      trainingTitle: '카드 짝 맞추기',
                      timeLeft,
                    })
                    flipCard(card.id)
                  }}
                  type="button"
                >
                  {(card.isFlipped || card.isMatched) && (
                    <div className="absolute inset-0 rounded-3xl border-4 border-transparent bg-gradient-to-br from-primary to-teal opacity-20" />
                  )}

                  {isMatchFeedback ? (
                    <span className="absolute right-2 top-2 rounded-full bg-success px-2 py-1 text-xs font-bold text-white">
                      정답
                    </span>
                  ) : null}

                  {isMismatchFeedback ? (
                    <span className="absolute right-2 top-2 rounded-full bg-danger px-2 py-1 text-xs font-bold text-white">
                      다시
                    </span>
                  ) : null}

                  <span
                    className={`absolute inset-0 flex items-center justify-center text-5xl leading-none transition-opacity duration-300 ${
                      card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'
                    } ${isMobile ? 'text-3xl' : isWeb ? 'text-4xl' : 'text-4xl'}`}
                  >
                    {card.content}
                  </span>

                  <span
                    aria-hidden={card.isFlipped || card.isMatched}
                    className={`absolute inset-0 flex items-center justify-center text-4xl font-bold leading-none transition-opacity duration-300 ${
                      card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'
                    } ${isMismatchFeedback ? 'text-danger' : 'text-border'} ${isMobile ? 'text-3xl' : 'text-4xl'}`}
                  >
                    ?
                  </span>
                </button>
              )
            })()
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
