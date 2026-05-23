import { ROUTE_PATHS } from '@/shared/config';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_QUIZ_COUNT = 5;

const WORD_QUIZ = [
  { answer: '사과', hint: '빨갛고 맛있는 가을 과일' },
  { answer: '나비', hint: '꽃에 앉는 날개 달린 곤충' },
  { answer: '하늘', hint: '구름이 떠 있는 푸른 공간' },
  { answer: '효도', hint: '부모님을 정성껏 모시는 일' },
  { answer: '부채', hint: '손으로 흔들어 바람을 일으켜 더위를 식히는데 쓰는 물건' },
  { answer: '달력', hint: '날짜와 요일이 표시된 종이나 책자 형태의 물건'},
  { answer: '연필', hint: '글씨를 쓰거나 그림을 그릴 때 사용하는 도구'},
  { answer: '우산', hint: '비를 맞지 않기 위해 머리 위에 쓰는 물건'},
  { answer: '시계', hint: '시간을 알려주는 물건'},
  { answer: '의자', hint: '앉을 때 사용하는 가구'},
];

export const useCognitiveTraining = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shuffledChars, setShuffledChars] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const navigate = useNavigate();

  const shuffledQuizList = useMemo(() => {
    return [...WORD_QUIZ]
      .sort(() => Math.random() - 0.5) // 전체 배열 무작위 셔플
      .slice(0, MAX_QUIZ_COUNT);       // 앞에서부터 딱 5개만 커트
  }, []);

  const initQuiz = useCallback(() => {
    const word = shuffledQuizList[currentIdx].answer;
    // 글자 섞기
    const chars = word.split('').sort(() => Math.random() - 0.5);
    setShuffledChars(chars);
    setUserAnswer('');
    setIsCorrect(null);
  }, [currentIdx, shuffledQuizList]);

  useEffect(() => { initQuiz(); }, [initQuiz]);

  const handleCharClick = (char: string, index: number) => {
    if (isCorrect !== null) return;

    const newAnswer = userAnswer + char;
    setUserAnswer(newAnswer);
    
    // 글자를 선택하면 목록에서 제거 (인덱스 기준)
    setShuffledChars(prev => prev.filter((_, i) => i !== index));

    // 정답 확인 (길이가 같아지면)
    if (newAnswer.length === shuffledQuizList[currentIdx].answer.length) {
      if (newAnswer === shuffledQuizList[currentIdx].answer) {
        setIsCorrect(true);
        const updatedScore = score + 25;
        setScore(updatedScore);
        setTimeout(() => {
          if (currentIdx < MAX_QUIZ_COUNT - 1) setCurrentIdx(prev => prev + 1);
          else {
            // 맞힌 점수를 계산하여 넘김
            const finalCorrectCount = updatedScore / 25; 

            navigate('/training/languageResult', {
              state: { score: finalCorrectCount } // 맞힌 개수를 결과 창 컴포넌트에 주입
            });
          }
        }, 1200);
      } else {
        setIsCorrect(false);
        setTimeout(() => {
          //다음 문제로 이동
          if (currentIdx < MAX_QUIZ_COUNT - 1) {
            setCurrentIdx(prev => prev + 1);
          } else {
            // 만약 틀린 문제가 마지막 문제였다면
            const finalCorrectCount = score / 25;
            
            navigate(ROUTE_PATHS.trainingLanguageResult, {
              state: { score: finalCorrectCount }
            });
          }
        }, 1200);
      }
    }
  };

  return { 
    quiz: shuffledQuizList[currentIdx], 
    shuffledChars, 
    userAnswer, 
    isCorrect, 
    score,
    handleCharClick,
    resetQuiz: initQuiz 
  };
};