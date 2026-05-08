// features/survey/hooks.ts
import { useState } from 'react';
import { SurveyQuestion, SurveyResponse } from './types';

export function useSurvey(questions: SurveyQuestion[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [yesCount, setYesCount] = useState(0);

const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentIndex];

    // riskAnswer와 사용자의 선택이 같으면 점수 추가
    if (answer === currentQuestion.riskAnswer) {
      setYesCount(prev => prev + 1);
    }

    // 응답 기록 저장
    const newResponse: SurveyResponse = {
      questionId: currentQuestion.id,
      answer: answer
    };
    setResponses(prev => [...prev, newResponse]);

    // 다음 질문으로 이동 또는 종료
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const categoryScores = responses.reduce((acc, curr) => {
    const question = questions.find(q => q.id === curr.questionId);
    if (question && curr.answer === question.riskAnswer) {
      const cat = question.category || "기타";
      acc[cat] = (acc[cat] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return {
    currentIndex,
    currentQuestion: questions[currentIndex],
    progress,
    isFinished,
    yesCount, 
    categoryScores,
    handleAnswer,
    goBack: () => {
      if (currentIndex > 0) {
        // 이전으로 돌아갈 때 점수 차감 로직
        const lastResponse = responses[responses.length - 1];
        if (lastResponse && lastResponse.answer === questions[currentIndex - 1].riskAnswer) {
          setYesCount(prev => prev - 1);
        }
        setResponses(prev => prev.slice(0, -1));
        setCurrentIndex(prev => prev - 1);
      }
    }
  };
}