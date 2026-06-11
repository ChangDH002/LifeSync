/**
 * 설문 도메인 타입
 */

export interface SurveyQuestion {
  id: string
  text: string
  description?: string
  options: SurveyOption[]
  category:
    | '인구통계'
    | '심혈관·대사'
    | '심리·신경'
    | '생활습관'
}

export interface SurveyOption {
  label: string
  value: string
  score: number
}

export interface SurveyResponse {
  questionId: string
  answer: string
  score: number
}

export type DementiaSurveyResponseMap = Record<string, string | number | boolean>

export interface DementiaSurveySubmitRequest {
  surveyType: 'dementia-risk'
  totalScore?: number
  riskLevel?: string
  categoryScores?: Record<string, number>
  responses: SurveyResponse[] | DementiaSurveyResponseMap
}

export interface ToolScoreBreakdown {
  rawScore: number
  normalizedScore: number
  matchedFactors: Record<string, number>
}

export interface DementiaSurveyScoreResponse {
  surveyType: string
  surveyVersion: string
  scoringVersion: string
  totalScore?: number
  riskLevel?: string
  finalRiskScore?: number
  categoryScores: Record<string, number>
  responseCount: number
  cogdrisk?: ToolScoreBreakdown
  anuAdri?: ToolScoreBreakdown
}

export interface DementiaSurveySubmitResponse extends DementiaSurveyScoreResponse {
  surveyId: string
  submittedAt: string
}
