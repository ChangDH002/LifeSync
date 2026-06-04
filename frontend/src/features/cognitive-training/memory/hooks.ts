import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Card {
  id: number
  content: string
  isFlipped: boolean
  isMatched: boolean
}

interface CardFeedback {
  cardIds: number[]
  type: 'match' | 'mismatch' | null
}

const PREVIEW_DURATION = 5

export const useCognitiveTraining = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [isGameOver, setIsGameOver] = useState(false)
  const [timeLeft, setTimeLeft] = useState(90)
  const [feedback, setFeedback] = useState<CardFeedback>({ cardIds: [], type: null })
  const [isPreviewing, setIsPreviewing] = useState(true)
  const [previewSecondsLeft, setPreviewSecondsLeft] = useState(PREVIEW_DURATION)
  const [clearTimeLeft, setClearTimeLeft] = useState(0)
  const [finalTime, setFinalTime] = useState(0)
  const isTimeOver = timeLeft === 0 && !isGameOver
  const navigate = useNavigate()
  const TOTAL_GAME_TIME = 90;

  const initGame = useCallback(() => {
    const emojis = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒']
    const duplicatedCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        isFlipped: true,
        isMatched: false,
      }))

    setCards(duplicatedCards)
    setFlippedCards([])
    setIsGameOver(false)
    setTimeLeft(90)
    setFeedback({ cardIds: [], type: null })
    setIsPreviewing(true)
    setPreviewSecondsLeft(PREVIEW_DURATION)
    setFinalTime(0)
    setClearTimeLeft(0)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  const flipCard = (id: number) => {
    const targetCard = cards.find((card) => card.id === id)

    if (
      !targetCard ||
      isPreviewing ||
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
        setFeedback({ cardIds: [firstId, secondId], type: 'match' })
        setCards(prev => prev.map(card => 
          card.id === firstId || card.id === secondId
           ? { ...card, isMatched: true } 
           : card
        ))
        setFlippedCards([])

        const timer = window.setTimeout(() => {
          setFeedback({ cardIds: [], type: null })
        }, 650)

        return () => window.clearTimeout(timer)
      } else {
        setFeedback({ cardIds: [firstId, secondId], type: 'mismatch' })
        const timer = setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId
             ? { ...card, isFlipped: false }
             : card
          ))
          setFlippedCards([])
          setFeedback({ cardIds: [], type: null })
        }, 1000)

        return () => clearTimeout(timer)
      }
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (isGameOver) return
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setTimeLeft(prev => prev)
      setIsGameOver(true)
    }
  }, [cards, isGameOver])

  useEffect(() => {
    if (!isPreviewing) {
      return
    }

    if (previewSecondsLeft <= 0) {
      setIsPreviewing(false)
      setCards((previousCards) =>
        previousCards.map((card) => ({
          ...card,
          isFlipped: false,
        })),
      )
      return
    }

    const timer = window.setTimeout(() => {
      setPreviewSecondsLeft((currentSeconds) => currentSeconds - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [isPreviewing, previewSecondsLeft])

  useEffect(() => {
    if (cards.length === 0 || isGameOver || isTimeOver || isPreviewing) {
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
  }, [cards.length, isGameOver, isPreviewing, isTimeOver])

  const elapsedTime = TOTAL_GAME_TIME - timeLeft// 버그 : 걸린 시간이 0초로 고정

  return {
    cards,
    flipCard,
    isGameOver,
    isPreviewing,
    isTimeOver,
    feedback,
    flippedCards,
    previewSecondsLeft,
    resetGame: initGame,
    timeLeft,
  }
}
