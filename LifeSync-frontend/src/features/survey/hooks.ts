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
    const selectedOption = currentQuestion.options.find((option) => option.value === answer);

    if (!selectedOption) {
      return;
    }

    setYesCount(prev => prev + selectedOption.score);

    // 응답 기록 저장
    const newResponse: SurveyResponse = {
      questionId: currentQuestion.id,
      answer: answer,
      score: selectedOption.score,
    };
    setResponses(prev => [...prev, newResponse]);

    // 다음 질문으로 이동 또는 종료
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const categoryScores = questions.reduce((acc, question) => {
    const category = question.category || "기타";
    acc[category] = 0;
    return acc;
  }, {} as Record<string, number>);

  responses.forEach((curr) => {
    const question = questions.find(q => q.id === curr.questionId);
    if (question) {
      const cat = question.category || "기타";
      categoryScores[cat] = (categoryScores[cat] || 0) + curr.score;
    }
  });

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return {
    currentIndex,
    currentQuestion: questions[currentIndex],
    progress,
    isFinished,
    responses,
    yesCount, 
    categoryScores,
    handleAnswer,
    goBack: () => {
      if (currentIndex > 0) {
        // 이전으로 돌아갈 때 점수 차감 로직
        const lastResponse = responses[responses.length - 1];
        if (lastResponse) {
          setYesCount(prev => prev - lastResponse.score);
        }
        setResponses(prev => prev.slice(0, -1));
        setCurrentIndex(prev => prev - 1);
      }
    }
  };
}
