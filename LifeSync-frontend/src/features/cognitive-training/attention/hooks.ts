/**
 * 인지훈련 도메인 Hook - 집중력(순서 따라가기)
 */
import { useCallback, useState } from 'react'

export const useCognitiveTraining = () => {
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [clickedButton, setClickedButton] = useState<number | null>(null)
  const [feedbackTone, setFeedbackTone] = useState<'default' | 'success' | 'error'>('default')
  const [feedbackMessage, setFeedbackMessage] = useState('훈련 시작하기를 눌러주세요.')
  const [completedRounds, setCompletedRounds] = useState(0)

  const showSequence = useCallback(async (nextSequence: number[]) => {
    setIsPlaying(true)
    setFeedbackTone('default')
    setFeedbackMessage('반짝이는 순서를 잘 기억하세요!')

    for (const buttonId of nextSequence) {
      await new Promise((resolve) => window.setTimeout(resolve, 550))
      setActiveButton(buttonId)
      await new Promise((resolve) => window.setTimeout(resolve, 380))
      setActiveButton(null)
    }

    setIsPlaying(false)
    setFeedbackMessage('기억한 순서대로 버튼을 눌러보세요!')
  }, [])

  const nextLevel = useCallback(() => {
    const nextNumber = Math.floor(Math.random() * 4)

    setSequence((previousSequence) => {
      const nextSequence = [...previousSequence, nextNumber]
      setUserSequence([])
      void showSequence(nextSequence)
      return nextSequence
    })
  }, [showSequence])

  const handleButtonClick = (id: number) => {
    if (isPlaying || sequence.length === 0) return

    setClickedButton(id)
    window.setTimeout(() => setClickedButton(null), 220)

    const nextUserSequence = [...userSequence, id]
    setUserSequence(nextUserSequence)

    if (id !== sequence[userSequence.length]) {
      setFeedbackTone('error')
      setFeedbackMessage('조금 달랐어요. 처음부터 다시 시작해볼게요.')

      window.setTimeout(() => {
        setSequence([])
        setUserSequence([])
        setClickedButton(null)
        setFeedbackTone('default')
        setFeedbackMessage('훈련 시작하기를 눌러주세요.')
      }, 700)
      return
    }

    if (nextUserSequence.length === sequence.length) {
      setCompletedRounds((current) => current + 1)
      setFeedbackTone('success')
      setFeedbackMessage('좋아요! 정확했어요. 다음 단계로 넘어갑니다.')

      window.setTimeout(() => {
        setClickedButton(null)
        nextLevel()
      }, 700)
      return
    }

    setFeedbackTone('success')
    setFeedbackMessage('정확해요! 이어서 다음 색도 눌러보세요.')

    window.setTimeout(() => {
      setClickedButton(null)
      setFeedbackTone('default')
      setFeedbackMessage('기억한 순서대로 버튼을 눌러보세요!')
    }, 350)
  }

  const start = useCallback(() => {
    setSequence([])
    setUserSequence([])
    setClickedButton(null)
    setFeedbackTone('default')
    setFeedbackMessage('반짝이는 순서를 잘 기억하세요!')
    setCompletedRounds(0)
    nextLevel()
  }, [nextLevel])

  return {
    activeButton,
    clickedButton,
    completedRounds,
    feedbackMessage,
    feedbackTone,
    handleButtonClick,
    isPlaying,
    sequence,
    start,
  }
}
