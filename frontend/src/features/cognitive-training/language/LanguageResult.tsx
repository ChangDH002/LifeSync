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

interface LanguageResultProps {
  score: number;
  total: number;
  onRetry: () => void;
}

export default function LanguageResult({ score, total = 5, onRetry }: LanguageResultProps) {
  const navigate = useNavigate();
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
          언어 유창성
        </span>
        
        <h2 className={`${DESIGN_SCALE.font.title} font-bold ${DESIGN_SCALE.color.textDark} mb-2`}>
          언어 능력 게임 결과
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
            상황에 맞는 올바른 단어를 빠르게 떠올리고 일상적인 문장 흐름을 매끄럽게 이해하는 능력을 확인하는 훈련입니다. 대화 시 맥락을 놓치지 않고 소중한 이들과 원활하게 소통할 수 있도록 돕는 두뇌 기초 체력이 됩니다. 마주하는 모든 대화 속에서 오해 없이 깊은 유대감을 나누며, 나의 일상과 온전한 동기화를 이루는 데 큰 도움이 됩니다.
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
            onClick={() => navigate('/training/language')}
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