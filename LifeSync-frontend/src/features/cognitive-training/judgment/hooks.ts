import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/shared/config'
import { useGameDifficulty } from '../difficulty'
import { getScenariosByDifficulty } from './data'

const QUESTIONS_PER_GAME = 2

export const useCognitiveTraining = () => {
  const navigate = useNavigate()
  const { difficulty, increaseDifficulty } = useGameDifficulty('judgment')

  // 난이도에 따라 시나리오를 가져오고, 선택지도 무작위로 섞음
  const randomScenarios = useMemo(() => {
    return getScenariosByDifficulty(difficulty, QUESTIONS_PER_GAME).map((scenario) => ({
      ...scenario,
      options: [...scenario.options].sort(() => Math.random() - 0.5),
    }))
  }, [difficulty])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null) return
    setSelectedIdx(idx)
    if (randomScenarios[currentIdx].options[idx].isCorrect) {
      setCorrectCount((prev) => prev + 1)
    }
  }

  const nextScenario = useCallback(() => {
    if (currentIdx < randomScenarios.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setSelectedIdx(null)
    } else {
      // 모든 문제를 맞췄을 때 난이도 상승
      if (correctCount === randomScenarios.length) {
        increaseDifficulty()
      }
      navigate(ROUTE_PATHS.trainingJudgmentResult, {
        state: { score: correctCount, total: randomScenarios.length },
      })
    }
  }, [correctCount, currentIdx, navigate, randomScenarios.length, increaseDifficulty])

  return {
    scenario: randomScenarios[currentIdx],
    currentIdx,
    selectedIdx,
    handleSelect,
    nextScenario,
    isLast: currentIdx === randomScenarios.length - 1,
    totalQuestions: randomScenarios.length,
    score: correctCount,
  }
}
