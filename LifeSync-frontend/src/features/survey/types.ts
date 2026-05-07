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
