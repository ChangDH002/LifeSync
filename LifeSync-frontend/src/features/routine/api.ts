import apiClient from '@/shared/api/client'
import type { TodayRoutinesResponse } from './types'

export const routineApi = {
  getTodayRoutines() {
    return apiClient.get<never, TodayRoutinesResponse>('/routines/today')
  },
}
