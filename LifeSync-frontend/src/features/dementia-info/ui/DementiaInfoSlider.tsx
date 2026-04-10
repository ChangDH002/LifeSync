import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CardData {
  icon: string;
  title: string;
  content: string;
}

const cardsData: CardData[] = [
  { icon: '🧠', title: '치매란 무엇인가?', content: '정상적으로 생활해오던 사람이 다양한 원인에 의해\n뇌기능이 손상되면서 인지 기능이 지속적으로 저하되는 상태입니다.' },
  { icon: '📉', title: '알츠하이머 병', content: '가장 흔한 치매 원인으로, 뇌세포에 독성 단백질이 쌓이면서\n서서히 뇌가 위축되고 기억력을 잃어갑니다.' },
  { icon: '🩸', title: '혈관성 치매', content: '뇌졸중 등 뇌혈관 문제로 뇌 조직이 손상되어 발생합니다.\n증상이 갑자기 나타나거나 계단식으로 악화되는 것이 특징입니다.' },
  { icon: '🛡️', title: '치매 예방 3·3·3', content: '3권: 운동, 식단, 독서 즐기기\n3금: 절주, 금연, 머리 부상 조심하기\n3행: 건강검진, 소통, 조기검진 챙기기' },
  { icon: '🥗', title: '인지 건강 식단', content: '뇌 건강을 위해 녹색 잎채소, 견과류, 베리류를 충분히 섭취하고\n가공식품과 포화지방 섭취를 줄이세요.' },
];

export function DementiaInfoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const moveCard = (direction: number) => {
    if (direction === -1 && currentIndex > 0) setCurrentIndex((prev) => prev - 1);
    else if (direction === 1 && currentIndex < cardsData.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // 화살표 버튼을 누를 때는 카드 드래그가 작동안하게 방지
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'button') return;
    setIsDragging(true);
    startX.current = 'pageX' in e ? e.pageX : e.touches[0].clientX;
  };

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const currentX = 'pageX' in e ? e.pageX : e.touches[0].clientX;
    setDragOffset(currentX - startX.current);
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50; 
    if (dragOffset < -threshold && currentIndex < cardsData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
    setDragOffset(0); // 드래그 끝나면 무조건 제자리로 초기화
  }, [isDragging, dragOffset, currentIndex]);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => handleMove(e);
    const onEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    // 겉 상자 전체를 화면 꽉 차게(w-full) 만들어서 찌그러짐 원천 차단
    <div className="py-10 px-5 w-full max-w-[800px] mx-auto select-none overflow-hidden">
      
      <div className="text-center mb-10">
        <h2 className="text-[28px] font-bold text-tealDark mb-2">치매 예방 정보</h2>
        <p className="text-[18px] text-contentLight m-0">카드를 밀거나 양옆 버튼을 눌러보세요</p>
      </div>

      {/* --- 절대 움직이지 않는 고정된 슬라이더 박스 --- */}
      <div 
        style={{ position: 'relative', width: '100%', height: '380px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        className="mb-10"
      >
        
        {/* ❮ 이전 버튼 (화면 왼쪽 10px 위치에 아예 못 박아버림) */}
        <button
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}
          className="w-[45px] h-[45px] md:w-[50px] md:h-[50px] bg-surface border border-border rounded-full text-primary text-[24px] flex justify-center items-center shadow-md hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          onClick={() => moveCard(-1)}
          disabled={currentIndex === 0}
        >
          ❮
        </button>

        {/* --- 카드 묶음 영역 --- */}
        <div 
          style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          className="touch-pan-y"
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        >
          {cardsData.map((card, index) => {
            const offset = index - currentIndex;
            const dragPercent = (dragOffset / 600) * 100; // 스와이프 부드러움 비율
            const activeOffset = offset - dragPercent / 60;

            const translateX = activeOffset * 115;
            const scale = Math.max(1 - Math.abs(activeOffset) * 0.1, 0.75); // 최소 75% 크기 유지
            const translateY = Math.abs(activeOffset) * -15;
            const zIndex = 10 - Math.abs(Math.round(activeOffset));
            
            const isActive = Math.round(activeOffset) === 0;

            return (
              <div
                key={index}
                style={{
                  transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                  zIndex,
                  transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  position: 'absolute',
                  width: '240px',
                  height: '320px',
                }}
                className={`bg-surface rounded-[20px] flex flex-col justify-center items-center text-center p-5 border-2 box-border flex-shrink-0 cursor-grab active:cursor-grabbing transition-colors duration-300 ${
                  isActive ? 'border-primary shadow-[0_20px_40px_rgba(92,138,107,0.15)]' : 'border-transparent shadow-md'
                }`}
              >
                <div className="text-[55px] mb-5">{card.icon}</div>
                {/* break-keep로 단어가 이상하게 잘리는 것 방지 */}
                <h3 className="m-0 text-[20px] font-bold text-content break-keep">{card.title}</h3>
              </div>
            );
          })}
        </div>

        {/* ❯ 다음 버튼 (화면 오른쪽 10px 위치에 못 박아버림) */}
        <button
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}
          className="w-[45px] h-[45px] md:w-[50px] md:h-[50px] bg-surface border border-border rounded-full text-primary text-[24px] flex justify-center items-center shadow-md hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          onClick={() => moveCard(1)}
          disabled={currentIndex === cardsData.length - 1}
        >
          ❯
        </button>
      </div>

      {/* --- 하단 상세 정보 박스 --- */}
      <div className="w-full max-w-[600px] mx-auto p-[30px] bg-surface border border-border rounded-[20px] shadow-sm text-center min-h-[140px] flex flex-col justify-center">
        <h4 className="mt-0 mb-[15px] text-[22px] font-bold text-primary break-keep">
          {cardsData[currentIndex].title}
        </h4>
        <p className="m-0 text-[18px] leading-[1.7] text-contentMid whitespace-pre-line">
          {cardsData[currentIndex].content}
        </p>
      </div>
      
    </div>
  );
}