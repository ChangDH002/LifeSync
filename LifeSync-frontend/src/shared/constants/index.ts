/**
 * 전역 상수
 */

export const APP_NAME = 'LifeSync'

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  users: {
    profile: '/users/profile',
    settings: '/users/settings',
  },
} as const

export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  SERVER_ERROR: '서버에 오류가 발생했습니다.',
  VALIDATION_ERROR: '입력 정보를 확인해주세요.',
} as const

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '로그인되었습니다.',
  LOGOUT_SUCCESS: '로그아웃되었습니다.',
  CREATE_SUCCESS: '생성되었습니다.',
  UPDATE_SUCCESS: '수정되었습니다.',
  DELETE_SUCCESS: '삭제되었습니다.',
} as const
