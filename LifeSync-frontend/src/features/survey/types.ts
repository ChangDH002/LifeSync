/**
 * 설문 도메인 타입
 */

export interface SurveyQuestion {
  id: string
  text: string
  options: string[]
  riskAnswer: string;
  category: "수면" | "식습관" | "신체활동" | "인지활동" | "정서 및 사회" | "생활관리";
}

export interface SurveyResponse {
  questionId: string
  answer: string
}

export interface DementiaSurveySubmitRequest {
  surveyType: 'dementia-risk'
  totalScore: number
  riskLevel: string
  categoryScores: Record<string, number>
  responses: SurveyResponse[]
}

export interface DementiaSurveySubmitResponse {
  surveyId: string
  surveyType: string
  totalScore: number
  riskLevel: string
  submittedAt: string
}
