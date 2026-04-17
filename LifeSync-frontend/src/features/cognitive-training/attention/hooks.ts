/**
 * 인지훈련 도메인 Hook - 집중력(순서 따라가기)
 */
import { useState, useCallback } from 'react';

export const useCognitiveTraining = () => {
  const [sequence, setSequence] = useState<number[]>([]); // 정답 순서
  const [userSequence, setUserSequence] = useState<number[]>([]); // 사용자 입력
  const [isPlaying, setIsPlaying] = useState(false); // 컴퓨터가 시연 중인지 여부
  const [activeButton, setActiveButton] = useState<number | null>(null); // 현재 하이라이트된 버튼

  // 다음 단계 추가
  const nextLevel = useCallback(() => {
    const nextNum = Math.floor(Math.random() * 4); // 4개의 버튼 중 하나
    setSequence(prev => [...prev, nextNum]);
    setUserSequence([]);
    showSequence([...sequence, nextNum]);
  }, [sequence]);

  // 컴퓨터가 순서를 보여주는 로직
  const showSequence = async (seq: number[]) => {
    setIsPlaying(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(res => setTimeout(res, 600)); // 대기
      setActiveButton(seq[i]); // 하이라이트 ON
      await new Promise(res => setTimeout(res, 400));
      setActiveButton(null); // 하이라이트 OFF
    }
    setIsPlaying(false);
  };

  // 사용자 클릭 핸들러
  const handleButtonClick = (id: number) => {
    if (isPlaying) return;

    const nextUserSeq = [...userSequence, id];
    setUserSequence(nextUserSeq);

    // 정답 확인
    if (id !== sequence[userSequence.length]) {
      alert("틀렸습니다! 다시 시작합니다.");
      setSequence([]);
      return;
    }

    // 단계 완료 확인
    if (nextUserSeq.length === sequence.length) {
      setTimeout(() => nextLevel(), 1000);
    }
  };

  return { sequence, activeButton, isPlaying, handleButtonClick, start: nextLevel };
};
