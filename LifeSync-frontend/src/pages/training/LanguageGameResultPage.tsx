import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LanguageResult from '@/features/cognitive-training/language/LanguageResult';

export function LanguageGameResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const score = location.state?.score ?? 0;
  const total = 5;

  const handleRetry = () => {
    navigate('/training/language');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LanguageResult 
        score={score} 
        total={total} 
        onRetry={handleRetry} 
      />
    </div>
  );
}