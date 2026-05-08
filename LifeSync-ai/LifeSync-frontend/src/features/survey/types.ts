/**
 * 설문 도메인 타입
 */

export interface SurveyQuestion {
  id: string
  text: string
  options: string[]
}

export interface SurveyResponse {
  questionId: string
  answer: string
}
