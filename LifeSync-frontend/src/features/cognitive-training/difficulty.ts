import { useState, useCallback } from 'react'
import type { TrainingCategory } from './types'

const MAX_DIFFICULTY = 3

const getInitialDifficulty = (category: TrainingCategory): number => {
  if (typeof window === 'undefined') return 1
  const savedDifficulty = localStorage.getItem(`cognitive-training-difficulty-${category}`)
  return savedDifficulty ? parseInt(savedDifficulty, 10) : 1
}

/**
 * 게임 카테고리별 난이도를 관리하는 훅.
 * 난이도는 localStorage에 저장되어 유지됩니다.
 * @param category - 'language', 'memory', 'judgment', 'attention'
 */
export const useGameDifficulty = (category: TrainingCategory) => {
  const [difficulty, setDifficulty] = useState(() => getInitialDifficulty(category))

  const increaseDifficulty = useCallback(() => {
    setDifficulty((prev) => {
      const newDifficulty = Math.min(prev + 1, MAX_DIFFICULTY)
      localStorage.setItem(`cognitive-training-difficulty-${category}`, String(newDifficulty))
      return newDifficulty
    })
  }, [category])

  return { difficulty, increaseDifficulty }
}