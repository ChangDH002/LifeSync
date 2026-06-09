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
  score: number;
  total: number;
  onRetry: () => void;
}

export default function AttentionResult({ score, total = 5, onRetry }: AttentionResultProps) {
  const navigate = useNavigate();
  void onRetry;
  const isPassed = score >= 3;

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
            맞힌 개수: <span className="text-[26px] font-black text-tealDark">{score}</span> / {total} 문제
          </div>
        </div>

        <div className="text-left bg-surface rounded-[80px] border-2 border-dashed border-border p-7 mb-8">
          <p className={`${DESIGN_SCALE.font.sub} ${DESIGN_SCALE.color.textDark} font-bold mb-2`}>
            💡 훈련 영역 안내
          </p>
          <p className={`${DESIGN_SCALE.font.sub} ${DESIGN_SCALE.color.textMid} leading-[1.7]`}>
            복잡한 대중교통 노선도나 여러 개의 복잡한 안내 사항 속에서 내가 필요한 정보를 빠르게 찾아내고 서로 대조하는 훈련입니다. 일상에서 자극 정보의 양이 많아져도 끈기 있게 집중하여 실수를 줄이도록 돕습니다.
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
            onClick={() => navigate('/training/attention')}
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
