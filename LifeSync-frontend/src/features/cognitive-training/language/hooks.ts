import { ROUTE_PATHS } from '@/shared/config'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const MAX_QUIZ_COUNT = 5
const DISTRACTOR_COUNT = 2
const DISTRACTOR_CHARS = ['가', '나', '다', '라', '마', '바', '소', '수', '기', '지', '차', '타', '호', '별', '꽃']

export interface ChoiceChar {
  id: string
  char: string
  used: boolean
}

const WORD_QUIZ = [
  { answer: '사과', hint: '빨갛고 맛있는 가을 과일' },
  { answer: '나비', hint: '꽃에 앉는 날개 달린 곤충' },
  { answer: '하늘', hint: '구름이 떠 있는 푸른 공간' },
  { answer: '효도', hint: '부모님을 정성껏 모시는 일' },
  { answer: '부채', hint: '손으로 흔들어 바람을 일으켜 더위를 식히는데 쓰는 물건' },
  { answer: '달력', hint: '날짜와 요일이 표시된 종이나 책자 형태의 물건' },
  { answer: '연필', hint: '글씨를 쓰거나 그림을 그릴 때 사용하는 도구' },
  { answer: '우산', hint: '비를 맞지 않기 위해 머리 위에 쓰는 물건' },
  { answer: '시계', hint: '시간을 알려주는 물건' },
  { answer: '의자', hint: '앉을 때 사용하는 가구' },
]

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = result[index]
    result[index] = result[randomIndex]
    result[randomIndex] = currentItem
  }
  return result
}

function buildChoiceChars(answer: string) {
  const answerChars = answer.split('')
  const distractors = shuffle(DISTRACTOR_CHARS.filter((char) => !answerChars.includes(char))).slice(
    0,
    DISTRACTOR_COUNT,
  )
  return shuffle([...answerChars, ...distractors]).map((char, index) => ({
    id: `${answer}-${char}-${index}`,
    char,
    used: false,
  }))
}

export const useCognitiveTraining = () => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [shuffledChars, setShuffledChars] = useState<ChoiceChar[]>([])
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [isTrainingComplete, setIsTrainingComplete] = useState(false)

  const navigate = useNavigate()

  const shuffledQuizList = useMemo(() => {
    return shuffle(WORD_QUIZ).slice(0, MAX_QUIZ_COUNT)
  }, [])

  const initQuiz = useCallback(() => {
    const word = shuffledQuizList[currentIdx].answer
    setShuffledChars(buildChoiceChars(word))
    setUserAnswer('')
    setIsCorrect(null)
    setIsTrainingComplete(false)
  }, [currentIdx, shuffledQuizList])

  useEffect(() => {
    initQuiz()
  }, [initQuiz])

  const handleCharClick = (choice: ChoiceChar) => {
    if (isCorrect !== null) return
    if (choice.used) return

    const newAnswer = userAnswer + choice.char
    setUserAnswer(newAnswer)
    setShuffledChars((prev) =>
      prev.map((item) => (item.id === choice.id ? { ...item, used: true } : item)),
    )

    if (newAnswer.length === shuffledQuizList[currentIdx].answer.length) {
      if (newAnswer === shuffledQuizList[currentIdx].answer) {
        setIsCorrect(true)
        const updatedScore = score + 25
        setScore(updatedScore)
        setTimeout(() => {
          if (currentIdx < MAX_QUIZ_COUNT - 1) {
            setCurrentIdx((prev) => prev + 1)
          } else {
            setIsTrainingComplete(true)
            const finalCorrectCount = updatedScore / 25
            navigate(ROUTE_PATHS.trainingLanguageResult, {
              state: { score: finalCorrectCount },
            })
          }
        }, 1200)
      } else {
        setIsCorrect(false)
        setTimeout(() => {
          if (currentIdx < MAX_QUIZ_COUNT - 1) {
            setCurrentIdx((prev) => prev + 1)
          } else {
            const finalCorrectCount = score / 25
            navigate(ROUTE_PATHS.trainingLanguageResult, {
              state: { score: finalCorrectCount },
            })
          }
        }, 1200)
      }
    }
  }

  return {
    quiz: shuffledQuizList[currentIdx],
    shuffledChars,
    userAnswer,
    isCorrect,
    isTrainingComplete,
    score,
    handleCharClick,
    resetQuiz: initQuiz,
  }
}
