/**
 * 앱 설정값
 */

export const APP_CONFIG = {
  name: 'LifeSync',
  version: '0.0.1',
  description: '삶과 기억의 싱크를 맞춰주는 라이프 케어 서비스',
} as const

export const ROUTE_PATHS = {
  home: '/',
  login: '/login',
  signup: '/signup',
  authCallback: '/auth/callback',
  mypage: '/mypage',
  settings: '/settings',
  avatar: '/avatar',
  routine: '/routine',
  training: '/training',
  trainingMemory: '/training/memory',
  trainingMemoryResult: '/training/memoryResult',
  trainingJudgment: '/training/judgment',
  trainingJudgmentResult: '/training/judgmentResult',
  trainingAttention: '/training/attention',
  trainingAttentionResult: '/training/attentionResult',
  trainingLanguage: '/training/language',
  trainingLanguageResult: '/training/languageResult',
  information: '/information',
  chatbot: '/chatbot',
  terms: '/terms',
  privacy: '/privacy',
  medicalNotice: '/medical-notice',
  survey: '/survey',
} as const

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
} as const

export const FEATURE_FLAGS = {
  enableChatbot: true,
  enableTraining: true,
} as const
