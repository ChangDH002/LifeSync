import { useCognitiveTraining } from './hooks';

export function AttentionGame() {
  const { sequence, activeButton, isPlaying, handleButtonClick, start } = useCognitiveTraining();

  // 버튼 설정 (색상 및 위치)
  const buttons = [
    { id: 0, color: 'bg-red-500', activeColor: 'bg-red-300 shadow-[0_0_40px_rgba(239,68,68,0.8)]', label: '빨강' },
    { id: 1, color: 'bg-blue-500', activeColor: 'bg-blue-300 shadow-[0_0_40px_rgba(59,130,246,0.8)]', label: '파랑' },
    { id: 2, color: 'bg-yellow-400', activeColor: 'bg-yellow-200 shadow-[0_0_40px_rgba(250,204,21,0.8)]', label: '노랑' },
    { id: 3, color: 'bg-green-500', activeColor: 'bg-green-300 shadow-[0_0_40px_rgba(34,197,94,0.8)]', label: '초록' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      {/* 게임 안내 및 시작 버튼 */}
      <div className="text-center">
        {sequence.length === 0 ? (
          <button
            onClick={start}
            className="rounded-full bg-primary px-12 py-6 text-3xl font-bold text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            훈련 시작하기
          </button>
        ) : (
          <div className="text-2xl font-bold text-gray-700">
            {isPlaying ? "반짝이는 순서를 잘 기억하세요!" : "기억한 순서대로 누르세요!"}
            <div className="mt-2 text-primary">현재 단계: {sequence.length}</div>
          </div>
        )}
      </div>

      {/* 4분할 버튼 그리드 (11.5: 높은 대비) */}
      <div className="grid grid-cols-2 gap-6 aspect-square">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleButtonClick(btn.id)}
            disabled={isPlaying || sequence.length === 0}
            className={`relative flex items-center justify-center rounded-3xl transition-all duration-200
              ${activeButton === btn.id ? btn.activeColor : `${btn.color} opacity-80`}
              ${isPlaying ? 'cursor-default' : 'cursor-pointer hover:opacity-100 active:scale-90'}
              min-h-[160px] md:min-h-[200px]
            `}
          >
            <span className="text-2xl font-black text-white/40">{btn.label}</span>
            
            {/* 반짝이는 효과를 위한 오버레이 */}
            {activeButton === btn.id && (
              <div className="absolute inset-0 rounded-3xl bg-white/30 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* 하단 도움말 */}
      <div className="rounded-2xl bg-gray-50 p-6 text-center border-2 border-dashed border-gray-200">
        <p className="text-lg text-gray-500 font-medium">
          컴퓨터가 보여주는 빛의 순서를 똑같이 따라 누르면<br />
          주의 집중력과 기억력이 쑥쑥 올라갑니다!
        </p>
      </div>
    </div>
  );
}