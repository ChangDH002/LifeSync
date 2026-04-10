/**
 * 전역 상수
 */

export const APP_NAME = 'LifeSync'

export const PRIMARY_NAV_ITEMS = [
  { label: '예방 정보', path: '/information' },
  { label: '나무 키우기', path: '/avatar' },
  { label: 'AI 챗봇', path: '/chatbot' },
  { label: '인지 훈련', path: '/training' },
] as const

export const FOOTER_SERVICE_LINKS = [
  { label: '예방 정보', path: '/information' },
  { label: '나무 키우기', path: '/avatar' },
  { label: 'AI 챗봇', path: '/chatbot' },
  { label: '인지 훈련', path: '/training' },
  { label: '마이페이지', path: '/mypage' },
] as const

export const FOOTER_POLICY_ITEMS = [
  { label: '서비스 이용약관', path: '/terms' },
  { label: '개인정보 처리방침', path: '/privacy' },
  { label: '의료 고지사항', path: '/medical-notice' },
] as const

export const FOOTER_SUPPORT_ITEMS = [
  '공지사항',
  '자주 묻는 질문',
  '고객센터',
] as const

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
