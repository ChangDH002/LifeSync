/**
 * 인지훈련 도메인 API
 * 기억력, 집중력, 판단력, 언어/인지 훈련
 */
import apiClient from '@/shared/api/client'
import type {
  TrainingParticipationSyncRequest,
  TrainingParticipationSyncResponse,
} from './types'

export const cognitiveTrainingApi = {
  reportParticipation(payload: TrainingParticipationSyncRequest) {
    return apiClient.post<never, TrainingParticipationSyncResponse>('/training/participation', payload)
  },
}
