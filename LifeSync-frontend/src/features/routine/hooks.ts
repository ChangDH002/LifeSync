import { useCallback, useEffect, useState } from 'react'
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
    completed: false,
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
  const [actionError, setActionError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadTodayRoutines = useCallback(async () => {
    try {
      const response = await routineApi.getTodayRoutines()
      setItems(normalizeRoutineItems(response))
      setIsFallback(false)
      setError(null)
    } catch (loadError) {
      console.error('today routines fetch failed', loadError)
      setItems(fallbackRoutineItems)
      setIsFallback(true)
      setError('루틴 API가 아직 연결되지 않아 추천 예시 루틴을 보여드리고 있어요.')
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function init() {
      await loadTodayRoutines()
      if (isMounted) {
        setIsLoading(false)
      }
    }

    void init()

    return () => {
      isMounted = false
    }
  }, [loadTodayRoutines])

  const toggleRoutineCompletion = useCallback(
    async (routineId: string, currentlyCompleted: boolean) => {
      if (isFallback) {
        setActionError('로그인 후 서버에 연결된 루틴에서만 완료할 수 있어요.')
        return
      }

      setTogglingId(routineId)
      setActionError(null)

      try {
        if (currentlyCompleted) {
          await routineApi.cancelRoutineCompletion(routineId)
        } else {
          await routineApi.completeRoutine(routineId)
        }
        await loadTodayRoutines()
      } catch (toggleError) {
        console.error('routine completion toggle failed', toggleError)
        setActionError('루틴 완료 상태를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        setTogglingId(null)
      }
    },
    [isFallback, loadTodayRoutines],
  )

  const completedCount = items.filter((item) => item.completed).length

  return {
    actionError,
    completedCount,
    error,
    isFallback,
    isLoading,
    items,
    togglingId,
    toggleRoutineCompletion,
  }
}
