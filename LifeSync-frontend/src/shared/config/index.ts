/**
 * 앱 설정값
 */

export const APP_CONFIG = {
  name: 'LifeSync',
  version: '0.0.1',
  description: '시니어 건강 관리 플랫폼',
} as const

export const ROUTE_PATHS = {
  home: '/',
  login: '/login',
  mypage: '/mypage',
  settings: '/settings',
  avatar: '/avatar',
  training: '/training',
  information: '/information',
  chatbot: '/chatbot',
} as const

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
} as const

export const FEATURE_FLAGS = {
  enableChatbot: true,
  enableTraining: true,
} as const
