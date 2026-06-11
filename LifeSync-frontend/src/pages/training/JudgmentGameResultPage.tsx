import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import JudgmentResult from '@/features/cognitive-training/judgment/JudgmentResult'
import { useTrainingParticipation } from '@/features/cognitive-training/hooks'

export function JudgmentGameResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 라우터 이동 시 넘어온 점수 데이터 추출
  const score = location.state?.score ?? 0;
  const total = location.state?.total ?? 2;

  useTrainingParticipation({
    gameCategory: 'judgment',
    gameName: '상황 판단력 훈련',
    metadata: { score, total },
  })

  const handleRetry = () => {
    // 게임 처음으로 다시 이동
    navigate('/training/judgment');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <JudgmentResult 
        score={score} 
        total={total} 
        onRetry={handleRetry} 
      />
    </div>
  );
}