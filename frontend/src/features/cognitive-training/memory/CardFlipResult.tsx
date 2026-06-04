import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, RefreshCw, ArrowRight } from 'lucide-react';

const DESIGN_SCALE = {
  font: { title: 'text-[34px]', status: 'text-[28px]', option: 'text-[22px]', sub: 'text-[18px]' },
  color: {
    primary: 'bg-primary text-surface hover:bg-teal hover:text-surface',
    secondary: 'bg-surface border-2 border-border text-contentMid hover:bg-base',
    textDark: 'text-tealDark', textMid: 'text-contentMid', bgBox: 'bg-surface', bgCard: 'bg-base',
  }
};

interface AttentionResultProps {
  time: number;
  onRetry: () => void;
}

export default function AttentionResult({ time = 0, onRetry }: AttentionResultProps) {
  const navigate = useNavigate();
  const isPassed = time <= 90;

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timeString = minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;

  return (
    <div className="flex flex-col items-center pt-10 pb-10 w-full bg-background font-sans">
      <div className={`w-full max-w-[600px] mx-auto ${DESIGN_SCALE.color.bgBox} rounded-[40px] p-10 shadow-md border-2 border-border text-center`}>
        
        <div className="flex justify-center mb-5">
          <div className="p-3 bg-base rounded-full border border-border shadow-sm">
            <Award className={`w-16 h-16 ${isPassed ? 'text-primary' : 'text-amber-500'}`} strokeWidth={2} />
          </div>
        </div>

        <span className="inline-block px-4 py-1 bg-teal text-surface text-[18px] font-bold rounded-full mb-3 shadow-sm">
          시각적 주의력
        </span>
        
        <h2 className={`${DESIGN_SCALE.font.title} font-bold ${DESIGN_SCALE.color.textDark} mb-2`}>
          주의력 게임 결과
        </h2>

        <div className={`${DESIGN_SCALE.color.bgCard} rounded-[25px] p-6 mb-6 border border-border`}>
          <div className={`${DESIGN_SCALE.font.status} font-black ${isPassed ? 'text-primary' : 'text-amber-600'} mb-1`}>
            {isPassed ? "훌륭하게 통과하셨습니다!" : "좋은 시도였습니다! 한 번 더 해볼까요?"}
          </div>
          <div className={`${DESIGN_SCALE.font.option} font-bold ${DESIGN_SCALE.color.textMid}`}>
            소요 시간: <span className="text-[26px] font-black text-tealDark">{timeString}</span>
          </div>
        </div>

        <div className="text-left bg-surface rounded-[80px] border-2 border-dashed border-border p-7 mb-8">
          <p className={`${DESIGN_SCALE.font.sub} ${DESIGN_SCALE.color.textDark} font-bold mb-2`}>
            💡 훈련 영역 안내
          </p>
          <p className={`${DESIGN_SCALE.font.sub} ${DESIGN_SCALE.color.textMid} leading-[1.7]`}>
            방금 보았던 카드의 위치와 그림을 머릿속에 쏙쏙 담아두는 기억의 방을 넓히는 훈련입니다. 일상 속에서 물건을 둔 곳을 기억하고 소중한 약속들을 잊지 않도록 뇌와 일상의 동기화를 맞춰주어, 건강하고 활기찬 생활을 유지하는 데 큰 도움이 됩니다.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate('/training')}
            className={`w-full py-5 flex items-center justify-center gap-2 ${DESIGN_SCALE.color.primary} ${DESIGN_SCALE.font.option} font-bold rounded-[22px] shadow-md transition-all`}
          >
            <span>홈으로 돌아가기</span>
            <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
          </button>

          <button 
            onClick={onRetry}
            className={`w-full py-5 flex items-center justify-center gap-2 ${DESIGN_SCALE.color.secondary} ${DESIGN_SCALE.font.option} font-bold rounded-[22px] transition-colors`}
          >
            <RefreshCw className="w-6 h-6" strokeWidth={2.5} />
            <span>이 게임 다시 도전하기</span>
          </button>
        </div>

      </div>
    </div>
  );
}