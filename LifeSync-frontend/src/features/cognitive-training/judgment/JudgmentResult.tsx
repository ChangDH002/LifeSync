import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, RefreshCw, ArrowRight } from 'lucide-react';

const DESIGN_SCALE = {
  font: {
    title: 'text-[34px]',
    status: 'text-[28px]',
    option: 'text-[22px]',
    sub: 'text-[18px]',
  },
  color: {
    primary: 'bg-primary text-surface hover:bg-teal hover:text-surface',
    secondary: 'bg-surface border-2 border-border text-contentMid hover:bg-base',
    textDark: 'text-tealDark',
    textMid: 'text-contentMid',
    bgBox: 'bg-surface',
    bgCard: 'bg-base',
  }
};

interface JudgmentResultProps {
  score: number; // 맞힌 개수
  total: number; // 총 문항 수
  onRetry: () => void;
}

export default function JudgmentResult({ score, total = 2, onRetry }: JudgmentResultProps) {
  const navigate = useNavigate();
  const isPassed = score >= 1; // 2문제 중 1문제 이상 맞히면 통과로 간주

  return (
    <div className="flex flex-col items-center pt-10 pb-10 w-full bg-background font-sans">
      <div className={`w-full max-w-[600px] mx-auto ${DESIGN_SCALE.color.bgBox} rounded-[40px] p-10 shadow-md border-2 border-border text-center`}>
        
        <div className="flex justify-center mb-5">
          <div className="p-3 bg-base rounded-full border border-border shadow-sm">
            <Award className={`w-16 h-16 ${isPassed ? 'text-primary' : 'text-amber-500'}`} strokeWidth={2} />
          </div>
        </div>

        <span className="inline-block px-4 py-1 bg-teal text-surface text-[18px] font-bold rounded-full mb-3 shadow-sm">
          판단 및 실행력
        </span>
        
        <h2 className={`${DESIGN_SCALE.font.title} font-bold ${DESIGN_SCALE.color.textDark} mb-2`}>
          판단력 게임 결과
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
            일상 속 판단의 순간에 유연하고 정확하게 대처할 수 있도록, 뇌와 일상의 동기화를 맞추는 훈련입니다. 상황을 빠르게 파악하고 올바른 행동을 선택하는 힘을 길러주어, 혼자서도 안전하고 자립적인 하루하루를 이어갈 수 있게 해줍니다.
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
            onClick={() => navigate('/training/judgment')}
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