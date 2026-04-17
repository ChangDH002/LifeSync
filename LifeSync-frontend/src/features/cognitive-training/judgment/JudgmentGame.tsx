import { useViewportMode } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { useCognitiveTraining } from './hooks'

export function JudgmentGame() {
  const { scenario, selectedIdx, handleSelect, nextScenario, isLast } = useCognitiveTraining()
  const { isMobile, isWeb } = useViewportMode()

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col px-4',
        isMobile ? 'max-w-3xl gap-5' : isWeb ? 'max-w-4xl gap-8' : 'max-w-3xl gap-6'
      )}
    >
      <div className={cn('font-medium text-gray-500', isMobile ? 'flex flex-col gap-2' : 'flex items-center justify-between')}>
        <span className={cn(isMobile ? 'text-base' : 'text-lg')}>상황 판단력 훈련</span>
        <span className={cn('rounded-full bg-primary/10 text-primary', isMobile ? 'px-3 py-1 text-sm' : 'px-4 py-1')}>
          문제 {scenario.id}
        </span>
      </div>

      <section className={cn('rounded-3xl border border-gray-100 bg-white shadow-sm', isMobile ? 'p-5' : 'p-8')}>
        <h2 className={cn('font-bold leading-snug text-gray-900', isMobile ? 'text-xl' : 'text-2xl md:text-3xl')}>
          {scenario.question}
        </h2>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {scenario.options.map((option, idx) => {
          const isSelected = selectedIdx === idx
          const isCorrect = option.isCorrect
          
          return (
            <button
              key={idx}
              disabled={selectedIdx !== null}
              className={`group relative flex items-center rounded-2xl border-2 text-left transition-all
                ${selectedIdx === null 
                  ? 'border-gray-200 bg-white hover:border-primary active:bg-gray-50' 
                  : isSelected 
                    ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                    : 'border-gray-100 bg-gray-50 opacity-60'
                } ${isMobile ? 'p-4' : 'p-6'}`}
              onClick={() => handleSelect(idx)}
              type="button"
            >
              <span className={`mr-4 flex shrink-0 items-center justify-center rounded-full font-bold
                ${isSelected 
                  ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                  : 'bg-gray-100 text-gray-500 group-hover:bg-primary group-hover:text-white'
                } ${isMobile ? 'h-8 w-8 text-base' : 'h-10 w-10 text-xl'}`}
              >
                {idx + 1}
              </span>
              
              <span className={cn('font-semibold text-gray-800', isMobile ? 'text-lg leading-7' : 'text-xl md:text-2xl')}>
                {option.text}
              </span>

              {isSelected && (
                <span className={cn('ml-auto', isMobile ? 'text-2xl' : 'text-3xl')}>
                  {isCorrect ? '✅' : '❌'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selectedIdx !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`mb-6 rounded-2xl p-6 text-center text-xl font-bold
            ${scenario.options[selectedIdx].isCorrect 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }`}
          >
            {scenario.options[selectedIdx].feedback}
          </div>
          
          {!isLast && (
            <button
              onClick={nextScenario}
              className={cn(
                'w-full rounded-2xl bg-primary font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95',
                isMobile ? 'py-4 text-lg' : 'py-5 text-2xl'
              )}
              type="button"
            >
              다음 문제 확인하기
            </button>
          )}

          {isLast && (
            <div className={cn('py-4 text-center font-medium text-gray-500', isMobile ? 'text-base' : '')}>
              오늘의 판단력 훈련을 모두 마쳤습니다!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
