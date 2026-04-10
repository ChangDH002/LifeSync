import { useCognitiveTraining } from './hooks';

export function LanguageGame() {
  const { quiz, shuffledChars, userAnswer, isCorrect, score, handleCharClick } = useCognitiveTraining();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <span className="text-xl font-bold text-primary">언어 점수: {score}</span>
        <span className="text-gray-500 font-medium">단어를 완성해 보세요!</span>
      </div>

      {/* 힌트 영역 */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border-2 border-primary/20 text-center">
        <p className="text-gray-400 text-lg mb-2 font-bold">[ 힌트 ]</p>
        <h2 className="text-3xl font-black text-gray-800 leading-tight">
          "{quiz.hint}"
        </h2>
      </section>

      {/* 정답 입력 영역 */}
      <div className="flex justify-center gap-4 min-h-[100px]">
        {quiz.answer.split('').map((_, i) => (
          <div 
            key={i}
            className={`flex h-20 w-20 items-center justify-center rounded-2xl border-4 text-4xl font-bold
              ${userAnswer[i] ? 'border-primary bg-primary/5' : 'border-dashed border-gray-200 bg-gray-50'}
              ${isCorrect === true ? 'border-green-500 text-green-600' : ''}
              ${isCorrect === false ? 'border-red-500 text-red-600' : ''}
            `}
          >
            {userAnswer[i] || ''}
          </div>
        ))}
      </div>

      {/* 글자 선택 버튼 영역 */}
      <div className="flex justify-center gap-4">
        {shuffledChars.map((char, idx) => (
          <button
            key={idx}
            onClick={() => handleCharClick(char, idx)}
            className="h-24 w-24 rounded-full bg-white text-4xl font-black shadow-lg border-2 border-gray-100 hover:border-primary active:scale-90 transition-all text-gray-800"
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}