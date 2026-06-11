/**
 * 설문 도메인 API
 * 치매 위험도 설문, 성향 설문
 */
import apiClient from '@/shared/api/client'
import type {
  DementiaSurveyScoreResponse,
  DementiaSurveySubmitRequest,
  DementiaSurveySubmitResponse,
} from './types'

export const surveyApi = {
  calculateDementiaRiskScore(payload: DementiaSurveySubmitRequest) {
    return apiClient.post<never, DementiaSurveyScoreResponse>('/survey/dementia-risk/score', payload)
  },

  saveDementiaRiskResult(payload: DementiaSurveySubmitRequest) {
    return apiClient.post<never, DementiaSurveySubmitResponse>('/survey/dementia-risk', payload)
  },
}
