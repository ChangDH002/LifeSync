import { useState, useEffect, useCallback } from 'react';

const WORD_QUIZ = [
  { answer: '사과', hint: '빨갛고 맛있는 가을 과일' },
  { answer: '나비', hint: '꽃에 앉는 날개 달린 곤충' },
  { answer: '하늘', hint: '구름이 떠 있는 푸른 공간' },
  { answer: '효도', hint: '부모님을 정성껏 모시는 일' },
];

export const useCognitiveTraining = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shuffledChars, setShuffledChars] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isTrainingComplete, setIsTrainingComplete] = useState(false);

  const initQuiz = useCallback(() => {
    const word = WORD_QUIZ[currentIdx].answer;
    // 글자 섞기
    const chars = word.split('').sort(() => Math.random() - 0.5);
    setShuffledChars(chars);
    setUserAnswer('');
    setIsCorrect(null);
    setIsTrainingComplete(false);
  }, [currentIdx]);

  useEffect(() => { initQuiz(); }, [initQuiz]);

  const handleCharClick = (char: string, index: number) => {
    if (isCorrect !== null) return;

    const newAnswer = userAnswer + char;
    setUserAnswer(newAnswer);
    
    // 글자를 선택하면 목록에서 제거 (인덱스 기준)
    setShuffledChars(prev => prev.filter((_, i) => i !== index));

    // 정답 확인 (길이가 같아지면)
    if (newAnswer.length === WORD_QUIZ[currentIdx].answer.length) {
      if (newAnswer === WORD_QUIZ[currentIdx].answer) {
        setIsCorrect(true);
        setScore(prev => prev + 25);
        setTimeout(() => {
          if (currentIdx < WORD_QUIZ.length - 1) setCurrentIdx(prev => prev + 1);
          else {
            setIsTrainingComplete(true);
            alert("모든 문제를 풀었습니다!");
          }
        }, 1200);
      } else {
        setIsCorrect(false);
        setTimeout(() => initQuiz(), 1000); // 틀리면 다시 섞기
      }
    }
  };

  return { 
    quiz: WORD_QUIZ[currentIdx], 
    shuffledChars, 
    userAnswer, 
    isCorrect, 
    isTrainingComplete,
    score,
    handleCharClick,
    resetQuiz: initQuiz 
  };
};
