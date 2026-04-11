import { useCognitiveTraining } from './hooks';

export function JudgmentGame() {
  const { scenario, selectedIdx, handleSelect, nextScenario, isLast } = useCognitiveTraining();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4">
      {/* 진행 상황 안내 */}
      <div className="flex justify-between items-center text-gray-500 font-medium">
        <span className="text-lg">상황 판단력 훈련</span>
        <span className="bg-primary/10 text-primary px-4 py-1 rounded-full">
          문제 {scenario.id}
        </span>
      </div>

      {/* 질문 카드 영역 */}
      <section className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold leading-snug text-gray-900 md:text-3xl">
          {scenario.question}
        </h2>
      </section>

      {/* 선택지 리스트 */}
      <div className="grid grid-cols-1 gap-4">
        {scenario.options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = option.isCorrect;
          
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selectedIdx !== null}
              className={`group relative flex items-center rounded-2xl border-2 p-6 text-left transition-all
                ${selectedIdx === null 
                  ? 'border-gray-200 bg-white hover:border-primary active:bg-gray-50' 
                  : isSelected 
                    ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                    : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
            >
              {/* 번호 표시 */}
              <span className={`mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl font-bold
                ${isSelected 
                  ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                  : 'bg-gray-100 text-gray-500 group-hover:bg-primary group-hover:text-white'
                }`}
              >
                {idx + 1}
              </span>
              
              <span className="text-xl font-semibold text-gray-800 md:text-2xl">
                {option.text}
              </span>

              {/* 정오답 아이콘 표시 */}
              {isSelected && (
                <span className="ml-auto text-3xl">
                  {isCorrect ? '✅' : '❌'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 피드백 및 다음 버튼 */}
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
              className="w-full rounded-2xl bg-primary py-5 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              다음 문제 확인하기
            </button>
          )}

          {isLast && (
            <div className="text-center text-gray-500 font-medium py-4">
              오늘의 판단력 훈련을 모두 마쳤습니다!
            </div>
          )}
        </div>
      )}
    </div>
  );
}