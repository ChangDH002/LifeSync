import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Icon } from 'lucide-react'
import { ROUTE_PATHS } from '@/shared/config'
import { useGameDifficulty } from '../difficulty'
import { getCardSetForGame } from './data'

interface Card {
  id: number
  key: string
  iconName: React.ElementType<Icon> | string // for compatibility
  content: string
  isFlipped: boolean
  isMatched: boolean
}

interface CardFeedback {
  cardIds: number[]
  type: 'match' | 'mismatch' | null
}

const PREVIEW_DURATION = 3
const GAME_TIME_SECONDS = 90

export const useCognitiveTraining = () => {
  const navigate = useNavigate()
  const { difficulty, increaseDifficulty } = useGameDifficulty('memory')

  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [isGameOver, setIsGameOver] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SECONDS)
  const [feedback, setFeedback] = useState<CardFeedback>({ cardIds: [], type: null })
  const [isPreviewing, setIsPreviewing] = useState(true)
  const [previewSecondsLeft, setPreviewSecondsLeft] = useState(PREVIEW_DURATION)
  const isTimeOver = timeLeft === 0 && !isGameOver

  const initGame = useCallback(() => {
    // 난이도에 따라 카드 쌍 개수 조절 (4, 6, 8쌍)
    const pairCount = difficulty * 2 + 2
    const cardSet = getCardSetForGame(pairCount)

    const initialCards = cardSet.map((card, index) => ({
      id: index,
      key: `${card.id}-${index}`,
      iconName: card.iconName,
      content: card.iconName, // 이전 버전 호환성
      isFlipped: true,
      isMatched: false,
    }))

    setCards(initialCards)
    setFlippedCards([])
    setIsGameOver(false)
    setTimeLeft(GAME_TIME_SECONDS)
    setFeedback({ cardIds: [], type: null })
    setIsPreviewing(true)
    setPreviewSecondsLeft(PREVIEW_DURATION)
  }, [difficulty])

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

    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, isFlipped: true } : card)))
    setFlippedCards((prev) => [...prev, id])
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

      if (firstCard.iconName === secondCard.iconName) {
        setFeedback({ cardIds: [firstId, secondId], type: 'match' })
        setCards((prev) =>
          prev.map((card) =>
            card.id === firstId || card.id === secondId ? { ...card, isMatched: true } : card,
          ),
        )
        setFlippedCards([])

        const timer = window.setTimeout(() => {
          setFeedback({ cardIds: [], type: null })
        }, 650)

        return () => window.clearTimeout(timer)
      } else {
        setFeedback({ cardIds: [firstId, secondId], type: 'mismatch' })
        const timer = setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card,
            ),
          )
          setFlippedCards([])
          setFeedback({ cardIds: [], type: null })
        }, 1000)

        return () => clearTimeout(timer)
      }
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (isGameOver) return
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setIsGameOver(true)
      // 성공적으로 완료 시 난이도 상승
      increaseDifficulty()
    }
  }, [cards, isGameOver, increaseDifficulty])

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
          setIsGameOver(true) // 시간이 다 되면 게임오버
          return 0
        }

        return currentTime - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [cards.length, isGameOver, isPreviewing, isTimeOver])

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
