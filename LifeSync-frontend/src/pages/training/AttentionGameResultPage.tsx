import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AttentionResult from '@/features/cognitive-training/attention/AttentionResult'
import { useTrainingParticipation } from '@/features/cognitive-training/hooks'

export function AttentionGameResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const score = location.state?.score ?? 0;
  const total = location.state?.total ?? 4;

  useTrainingParticipation({
    gameCategory: 'attention',
    gameName: '집중력 강화 훈련',
    metadata: { score, total },
  })

  const handleRetry = () => {
    navigate('/training/attention');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AttentionResult 
        score={score} 
        total={total} 
        onRetry={handleRetry} 
      />
    </div>
  );
}