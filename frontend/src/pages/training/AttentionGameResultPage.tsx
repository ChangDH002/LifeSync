import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AttentionResult from '@/features/cognitive-training/attention/AttentionResult';

export function AttentionGameResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const score = location.state?.score ?? 0;
  const total = 4;

  const handleRetry = () => {
    navigate('/training/attentionResult');
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