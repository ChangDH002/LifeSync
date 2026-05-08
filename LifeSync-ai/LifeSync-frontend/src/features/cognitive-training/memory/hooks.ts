import { useState, useEffect, useCallback } from 'react';

interface Card {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}
export const useCognitiveTraining = () => {
  // TODO: 인지훈련 로직 구현
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  // 초기화
  const initGame = useCallback(() => {
    const emojis = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒'];
    const duplicatedCards = [...emojis, ...emojis]
    .sort(() => Math.random() - 0.5)
    .map((content, index) => ({
      id: index,
      content,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(duplicatedCards);
    setFlippedCards([]);
    setIsGameOver(false);
  }, []);

  //컴포넌트 마운트 시 게임 시작
  useEffect(() => {
    initGame();
  }, [initGame]);

  // 카드 클릭 핸들러
  const flipCard = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    ));
    setFlippedCards(prev => [...prev, id]);
  };

  // 짝 맞추기 검증 로직
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;

      if (cards[firstId].content === cards[secondId].content) {//일치
        setCards(prev => prev.map(card => 
          card.id === firstId || card.id === secondId
           ? { ...card, isMatched: true } 
           : card
        ));
        setFlippedCards([]);
      } else {//불일치
        const timer = setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId
             ? { ...card, isFlipped: false }
             : card
          ));
          setFlippedCards([]);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [flippedCards, cards]);

  // 게임 종료 조건 확인
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setIsGameOver(true);
    }
  }, [cards]);

  return {
    cards,
    flipCard,
    isGameOver,
    resetGame: initGame
  };
};