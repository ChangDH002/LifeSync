import { TodayRoutinesResponse } from './types'

// 이 함수는 실제 앱에서는 인증 토큰을 자동으로 포함하는 공유 인스턴스를 사용해야 합니다.
const fetchWithAuth = async (url: string, options?: RequestInit) => {
  // TODO: localStorage 대신 더 안전한 방식으로 토큰을 관리해야 합니다.
  const token = localStorage.getItem('accessToken')
  const headers = {
    ...options?.headers,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  return fetch(url, { ...options, headers })
}

export const routineApi = {
  getToday: async (): Promise<TodayRoutinesResponse> => {
    const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/routines/today`)
    if (!response.ok) {
      throw new Error('오늘의 루틴을 불러오는 데 실패했습니다.')
    }
    return response.json()
  },
}