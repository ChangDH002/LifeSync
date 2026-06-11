import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/shared/config'
import { useGameDifficulty } from '../difficulty'
import { getQuestionsForLevel, type LanguageGameQuestion } from './data'

const MAX_QUIZ_COUNT = 5
const SCORE_PER_CORRECT = 100 / MAX_QUIZ_COUNT

export const useCognitiveTraining = () => {
  const navigate = useNavigate()
  const { difficulty, increaseDifficulty } = useGameDifficulty('language')

  const quizList = useMemo(() => getQuestionsForLevel(difficulty, MAX_QUIZ_COUNT), [difficulty])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [shuffledChars, setShuffledChars] = useState<string[]>([])
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [isGameEnd, setIsGameEnd] = useState(false)

  const initQuiz = useCallback(() => {
    if (!quizList[currentIdx]) return

    const currentQuiz = quizList[currentIdx]
    // 정답과 항상 다르게 섞이도록 보장
    let newShuffled = currentQuiz.word.split('').sort(() => Math.random() - 0.5)
    while (newShuffled.join('') === currentQuiz.word) {
      newShuffled = currentQuiz.word.split('').sort(() => Math.random() - 0.5)
    }
    setShuffledChars(newShuffled)
    setUserAnswer('')
    setIsCorrect(null)
    setIsGameEnd(false)
  }, [currentIdx, quizList])

  useEffect(() => {
    initQuiz()
  }, [initQuiz])

  const proceedToNext = useCallback(() => {
    if (currentIdx < MAX_QUIZ_COUNT - 1) {
      setCurrentIdx((prev) => prev + 1)
    } else {
      setIsGameEnd(true)
      // 80% 이상 맞췄을 때 난이도 상승
      if (score >= 80) {
        increaseDifficulty()
      }
      navigate(ROUTE_PATHS.trainingLanguageResult, {
        state: { score: score / SCORE_PER_CORRECT, total: MAX_QUIZ_COUNT },
      })
    }
  }, [currentIdx, score, navigate, increaseDifficulty])

  const handleCharClick = (char: string, index: number) => {
    if (isCorrect !== null) return

    // 사용자가 선택한 글자를 답변에 추가
    const newAnswer = userAnswer + char
    setUserAnswer(newAnswer)
    // 선택지에서 해당 글자 제거
    setShuffledChars((prev) => prev.filter((_, i) => i !== index))

    // 정답 단어 길이와 같아지면 정답 확인
    if (newAnswer.length === quizList[currentIdx].word.length) {
      if (newAnswer === quizList[currentIdx].word) {
        setIsCorrect(true)
        setScore((prev) => prev + SCORE_PER_CORRECT)
        setTimeout(proceedToNext, 1200)
      } else {
        setIsCorrect(false)
        setTimeout(proceedToNext, 1200)
      }
    }
  }

  return {
    quiz: quizList[currentIdx]
      ? { answer: quizList[currentIdx].word, hint: quizList[currentIdx].category }
      : { answer: '', hint: '문제 로딩 중...' },
    shuffledChars,
    userAnswer,
    isCorrect,
    isTrainingComplete: isGameEnd, // 호환성을 위해 이름 유지
    score,
    handleCharClick,
    resetQuiz: initQuiz,
  }
}
