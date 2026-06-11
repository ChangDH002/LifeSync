import { useQuery } from '@tanstack/react-query'
import { routineApi } from './api'
import { RoutineItem } from './types'

const fallbackRoutines: RoutineItem[] = [
  {
    id: 'fallback-1',
    title: '식사 후 10분 가벼운 걷기',
    completed: false,
    active: true,
  },
  {
    id: 'fallback-2',
    title: '하루 한 번 가족 또는 지인과 대화하기',
    completed: false,
    active: true,
  },
  {
    id: 'fallback-3',
    title: '취침 전 밝은 화면 줄이고 수면 준비하기',
    completed: false,
    active: true,
  },
]

export const useTodayRoutines = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todayRoutines'],
    queryFn: routineApi.getToday,
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시된 데이터 사용
    retry: false, // 이 예제에서는 실패 시 재시도 안 함
  })

  const isFallback = !data && !isLoading && !!error

  return {
    items: isFallback ? fallbackRoutines : data?.items ?? [],
    isLoading,
    isFallback,
    error: error ? '루틴 정보를 불러오는 데 실패했습니다. 예시 데이터를 보여드립니다.' : null,
  }
}