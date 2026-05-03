import { useViewportMode } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { useTrainingActivityReporter } from '../hooks'
import { useCognitiveTraining } from './hooks'

export function LanguageGame() {
  const { quiz, shuffledChars, userAnswer, isCorrect, score, handleCharClick } = useCognitiveTraining()
  const { isMobile, isWeb } = useViewportMode()
  const { reportParticipation } = useTrainingActivityReporter({
    gameCategory: 'language',
    gameName: '단어 완성하기',
  })

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col px-4',
        isMobile ? 'max-w-3xl gap-5 py-2' : isWeb ? 'max-w-4xl gap-8 py-6' : 'max-w-3xl gap-6 py-4'
      )}
    >
      <div
        className={cn(
          'rounded-2xl border border-gray-100 bg-white shadow-sm',
          isMobile ? 'flex flex-col gap-2 p-4 text-center' : 'flex items-center justify-between p-5'
        )}
      >
        <span className={cn('font-bold text-primary', isMobile ? 'text-lg' : 'text-xl')}>언어 점수: {score}</span>
        <span className={cn('font-medium text-gray-500', isMobile ? 'text-sm' : '')}>단어를 완성해 보세요!</span>
      </div>

      <section className={cn('rounded-3xl border-2 border-primary/20 bg-white text-center shadow-sm', isMobile ? 'p-5' : 'p-8')}>
        <p className={cn('mb-2 font-bold text-gray-400', isMobile ? 'text-base' : 'text-lg')}>[ 힌트 ]</p>
        <h2 className={cn('font-black leading-tight text-gray-800', isMobile ? 'text-2xl' : 'text-3xl')}>
          "{quiz.hint}"
        </h2>
      </section>

      <div className={cn('flex min-h-[100px] justify-center', isMobile ? 'gap-2' : 'gap-4')}>
        {quiz.answer.split('').map((_, i) => (
          <div 
            key={i}
            className={`flex items-center justify-center rounded-2xl border-4 font-bold
              ${userAnswer[i] ? 'border-primary bg-primary/5' : 'border-dashed border-gray-200 bg-gray-50'}
              ${isCorrect === true ? 'border-green-500 text-green-600' : ''}
              ${isCorrect === false ? 'border-red-500 text-red-600' : ''}
              ${isMobile ? 'h-14 w-14 text-2xl' : 'h-20 w-20 text-4xl'}
            `}
          >
            {userAnswer[i] || ''}
          </div>
        ))}
      </div>

      <div className={cn(isMobile ? 'flex flex-wrap justify-center gap-2' : isWeb ? 'grid grid-cols-4 gap-4' : 'flex flex-wrap justify-center gap-4')}>
        {shuffledChars.map((char, idx) => (
          <button
            key={idx}
            className={cn(
              'rounded-full border-2 border-gray-100 bg-white font-black text-gray-800 shadow-lg transition-all hover:border-primary active:scale-90',
              isMobile ? 'h-16 w-16 text-2xl' : 'h-24 w-24 text-4xl'
            )}
            onClick={() => {
              void reportParticipation({
                trainingTitle: '단어 완성하기',
                currentScore: score,
              })
              handleCharClick(char, idx)
            }}
            type="button"
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  )
}
