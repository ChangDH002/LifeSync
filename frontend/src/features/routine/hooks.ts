import { useEffect, useState } from 'react'
import { routineApi } from './api'
import type { RoutineItem, TodayRoutinesResponse } from './types'

const fallbackRoutineItems: RoutineItem[] = [
  {
    id: 'routine-walk',
    title: '식사 후 10분 가벼운 걷기',
    completed: false,
  },
  {
    id: 'routine-talk',
    title: '하루 한 번 가족 또는 지인과 대화하기',
    completed: true,
  },
  {
    id: 'routine-sleep',
    title: '취침 전 밝은 화면 줄이고 수면 준비하기',
    completed: false,
  },
]

function normalizeRoutineItems(payload: TodayRoutinesResponse | null | undefined) {
  return payload?.items?.length ? payload.items : fallbackRoutineItems
}

export function useTodayRoutines() {
  const [items, setItems] = useState<RoutineItem[]>(fallbackRoutineItems)
  const [isLoading, setIsLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadTodayRoutines() {
      try {
        const response = await routineApi.getTodayRoutines()

        if (!isMounted) {
          return
        }

        setItems(normalizeRoutineItems(response))
        setIsFallback(false)
        setError(null)
      } catch (loadError) {
        console.error('today routines fetch failed', loadError)

        if (!isMounted) {
          return
        }

        setItems(fallbackRoutineItems)
        setIsFallback(true)
        setError('루틴 API가 아직 연결되지 않아 추천 예시 루틴을 보여드리고 있어요.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTodayRoutines()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    error,
    isFallback,
    isLoading,
    items,
  }
}
