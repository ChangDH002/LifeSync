import { GameLayout } from '../ui/GameLayout';
import { useCognitiveTraining } from '../memory/hooks';

export function CardFlipGame() {
  const { cards, flipCard, isGameOver, resetGame } = useCognitiveTraining();

  return (
    <GameLayout title="하루 5분 회상 퀴즈">
      <div className="text-center">
        {/*게임 종료 여부에 따른 안내 문구 분기*/}
        <p className="text-22px mb-10 font-bold text-contentMid leading-relaxed">
          {isGameOver ? (
            <span className="text-primary">축하합니다! 모든 카드를 찾았어요!</span>
          ) : (
            <>똑같은 그림이 그려진 <br /> 카드 2장을 찾아보세요!</>
          )}
        </p>
        
        {/* 카드 그리드 */}
        <div className="grid grid-cols-3 gap-8">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)} // 클릭 시 카드 뒤집기 로직 호출
              className={`
                relative h-40 rounded-3xl transition-all active:scale-95 flex items-center justify-center
                ${card.isFlipped || card.isMatched 
                  ? 'bg-primaryPale border-4 border-primary shadow-none' 
                  : 'bg-surface border-2 border-border shadow-soft'}
              `}
            >
              {/* 카드 선택/일치 시 그라데이션 효과 적용 */}
              {(card.isFlipped || card.isMatched) && (
                <div className="absolute inset-0 rounded-3xl border-4 border-transparent bg-gradient-to-br from-primary to-teal opacity-20" />
              )}

              {/* 카드 내용 */}
              <span className={`text-5xl transition-opacity duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
                {card.content}
              </span>

              {/* 뒷면 표시 */}
              {!(card.isFlipped || card.isMatched) && (
                <span className="text-4xl text-border font-bold">?</span>
              )}
            </button>
          ))}
        </div>

        {/* 하단 제어 영역 */}
        <div className="mt-12 flex flex-col items-center gap-6">
          {isGameOver ? (
            // 게임 종료 시 재시작 버튼
            <button 
              onClick={resetGame}
              className="px-12 py-5 bg-gradient-to-r from-primary to-teal text-white text-22px font-bold rounded-2xl shadow-md active:scale-95 transition-transform"
            >
              한 번 더 하기
            </button>
          ) : (
            <div className="w-full py-6 rounded-2xl bg-primaryPale">
              <p className="text-20px font-extrabold text-tealDark">
                남은 시간: <span className="font-mono">01:30</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}