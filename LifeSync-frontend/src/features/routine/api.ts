import apiClient from '@/shared/api/client'
import type { RoutineCompletionActionResponse, TodayRoutinesResponse } from './types'

export const routineApi = {
  getTodayRoutines() {
    return apiClient.get<never, TodayRoutinesResponse>('/routines/today')
  },

  completeRoutine(routineId: string) {
    return apiClient.post<never, RoutineCompletionActionResponse>(
      `/routines/${routineId}/complete`,
    )
  },

  cancelRoutineCompletion(routineId: string) {
    return apiClient.delete<never, RoutineCompletionActionResponse>(
      `/routines/${routineId}/complete`,
    )
  },
}
