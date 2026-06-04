import { useCallback, useEffect, useRef, useState } from 'react'

interface CardData {
  icon: string
  title: string
  content: string
}

const cardsData: CardData[] = [
  { icon: '🧠', title: '치매란 무엇인가?', content: '정상적으로 생활해오던 사람이 다양한 원인에 의해\n뇌기능이 손상되면서 인지 기능이 지속적으로 저하되는 상태입니다.' },
  { icon: '📉', title: '알츠하이머 병', content: '가장 흔한 치매 원인으로, 뇌세포에 독성 단백질이 쌓이면서\n서서히 뇌가 위축되고 기억력을 잃어갑니다.' },
  { icon: '🩸', title: '혈관성 치매', content: '뇌졸중 등 뇌혈관 문제로 뇌 조직이 손상되어 발생합니다.\n증상이 갑자기 나타나거나 계단식으로 악화되는 것이 특징입니다.' },
  { icon: '🛡️', title: '치매 예방 3·3·3', content: '3권: 운동, 식단, 독서 즐기기\n3금: 절주, 금연, 머리 부상 조심하기\n3행: 건강검진, 소통, 조기검진 챙기기' },
  { icon: '🥗', title: '인지 건강 식단', content: '뇌 건강을 위해 녹색 잎채소, 견과류, 베리류를 충분히 섭취하고\n가공식품과 포화지방 섭취를 줄이세요.' },
  { icon: '🛡️', title: '인지 예비능이란', content: '뇌 세포의 손상이 생기더라도 그 손상을 보완하고 \n뇌 기능을 정상적으로 유지할 수 있는 능력입니다. \n새로운 언어 배우기, 복잡한 퍼즐 풀기, 꾸준한 사회적 교류 등이 \n인지 예비능을 높이는 데 매우 효과적입니다.'},
  { icon: '✍️', title: '글쓰기와 아이디어 밀도', content: '풍부한 어휘를 담은 글쓰기는 뇌 건강의 지표입니다.\n젊은 시절부터 일기를 쓰거나 생각을 글로 정리하는 습관은\n인지 예비능을 높여 노년기 치매 위험을 크게 낮춰줍니다. \n있었던 일들을 단순히 나열하기보다, 느꼈던 감정이나 관찰한 내용을 \n구체적인 단어를 사용해 기록하는 것이 좋습니다' },
]

export function DementiaInfoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)

  const moveCard = (direction: number) => {
    if (direction === -1 && currentIndex > 0) setCurrentIndex((prev) => prev - 1)
    else if (direction === 1 && currentIndex < cardsData.length - 1) setCurrentIndex((prev) => prev + 1)
  }

  const moveToCard = (index: number) => {
    setCurrentIndex(index)
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'button') return
    setIsDragging(true)
    startX.current = 'pageX' in e ? e.pageX : e.touches[0].clientX
  }

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    const currentX = 'pageX' in e ? e.pageX : e.touches[0].clientX
    setDragOffset(currentX - startX.current)
  }, [isDragging])

  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    
    const threshold = 50
    if (dragOffset < -threshold && currentIndex < cardsData.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
    setDragOffset(0)
  }, [isDragging, dragOffset, currentIndex])

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => handleMove(e)
    const onEnd = () => handleEnd()

    if (isDragging) {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onEnd)
      window.addEventListener('touchmove', onMove, { passive: true })
      window.addEventListener('touchend', onEnd)
    }

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [isDragging, handleMove, handleEnd])

  return (
    <div className="pt-2 pb-10 px-5 w-full max-w-[800px] mx-auto select-none overflow-hidden">
      <div className="text-center mb-6">
        <h2 className="text-[28px] font-bold text-tealDark mb-2">치매 예방 정보</h2>
        <p className="text-[18px] text-contentLight m-0">카드를 밀거나 양옆 카드, 버튼을 눌러보세요</p>
      </div>

      <div 
        style={{ position: 'relative', width: '100%', height: '380px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        className="mb-10"
      >
        <button
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}
          className="w-[45px] h-[45px] md:w-[50px] md:h-[50px] bg-surface border border-border rounded-full text-primary text-[24px] flex justify-center items-center shadow-md hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          onClick={() => moveCard(-1)}
          disabled={currentIndex === 0}
        >
          ❮
        </button>

        <div 
          style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          className="touch-pan-y"
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        >
          {cardsData.map((card, index) => {
            const offset = index - currentIndex
            const dragPercent = (dragOffset / 600) * 100
            const activeOffset = offset - dragPercent / 60

            const translateX = activeOffset * 115
            const scale = Math.max(1 - Math.abs(activeOffset) * 0.1, 0.75)
            const translateY = Math.abs(activeOffset) * -15
            const zIndex = 10 - Math.abs(Math.round(activeOffset))
            
            const isActive = Math.round(activeOffset) === 0

            return (
              <button
                aria-label={`${card.title} 카드 보기`}
                key={index}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                  zIndex,
                  transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  position: 'absolute',
                  width: '240px',
                  height: '320px',
                }}
                className={`bg-surface rounded-[20px] flex flex-col justify-center items-center text-center p-5 border-2 box-border flex-shrink-0 cursor-grab active:cursor-grabbing transition-colors duration-300 ${
                  isActive ? 'border-primary shadow-[0_20px_40px_rgba(92,138,107,0.15)]' : 'border-transparent shadow-md'
                }`}
                onClick={() => moveToCard(index)}
                type="button"
              >
                <div className="text-[55px] mb-5">{card.icon}</div>
                <h3 className="m-0 text-[20px] font-bold text-content break-keep">{card.title}</h3>
              </button>
            )
          })}
        </div>

        <button
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}
          className="w-[45px] h-[45px] md:w-[50px] md:h-[50px] bg-surface border border-border rounded-full text-primary text-[24px] flex justify-center items-center shadow-md hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          onClick={() => moveCard(1)}
          disabled={currentIndex === cardsData.length - 1}
        >
          ❯
        </button>
      </div>

      <div className="w-full max-w-[600px] mx-auto p-[30px] bg-surface border border-border rounded-[20px] shadow-sm text-center min-h-[140px] flex flex-col justify-center">
        <h4 className="mt-0 mb-[15px] text-[22px] font-bold text-primary break-keep">
          {cardsData[currentIndex].title}
        </h4>
        <p className="m-0 text-[18px] leading-[1.7] text-contentMid whitespace-pre-line">
          {cardsData[currentIndex].content}
        </p>
      </div>
    </div>
  )
}
