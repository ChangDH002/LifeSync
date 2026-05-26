import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CardFlipResult from '@/features/cognitive-training/memory/CardFlipResult';

export function MemoryGameResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const totalSeconds = location.state?.time ?? 0;

  const handleRetry = () => {
    navigate('/training/memory');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <CardFlipResult 
        time={totalSeconds} 
        onRetry={handleRetry} 
      />
    </div>
  );
}