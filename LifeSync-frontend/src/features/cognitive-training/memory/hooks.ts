import { useCallback, useEffect, useState } from 'react'

interface Card {
  id: number
  content: string
  isFlipped: boolean
  isMatched: boolean
}

export const useCognitiveTraining = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [isGameOver, setIsGameOver] = useState(false)
  const [timeLeft, setTimeLeft] = useState(90)
  const isTimeOver = timeLeft === 0 && !isGameOver

  const initGame = useCallback(() => {
    const emojis = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒']
    const duplicatedCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        isFlipped: false,
        isMatched: false,
      }))

    setCards(duplicatedCards)
    setFlippedCards([])
    setIsGameOver(false)
    setTimeLeft(90)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  const flipCard = (id: number) => {
    const targetCard = cards.find((card) => card.id === id)

    if (
      !targetCard ||
      isTimeOver ||
      flippedCards.length === 2 ||
      targetCard.isFlipped ||
      targetCard.isMatched
    ) {
      return
    }

    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    ))
    setFlippedCards(prev => [...prev, id])
  }

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards
      const firstCard = cards.find((card) => card.id === firstId)
      const secondCard = cards.find((card) => card.id === secondId)

      if (!firstCard || !secondCard) {
        setFlippedCards([])
        return
      }

      if (firstCard.content === secondCard.content) {
        setCards(prev => prev.map(card => 
          card.id === firstId || card.id === secondId
           ? { ...card, isMatched: true } 
           : card
        ))
        setFlippedCards([])
      } else {
        const timer = setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId
             ? { ...card, isFlipped: false }
             : card
          ))
          setFlippedCards([])
        }, 1000)

        return () => clearTimeout(timer)
      }
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setIsGameOver(true)
    }
  }, [cards])

  useEffect(() => {
    if (cards.length === 0 || isGameOver || isTimeOver) {
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          window.clearInterval(timer)
          return 0
        }

        return currentTime - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [cards.length, isGameOver, isTimeOver])

  return {
    cards,
    flipCard,
    isGameOver,
    isTimeOver,
    resetGame: initGame,
    timeLeft,
  }
}
