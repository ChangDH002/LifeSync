/**
 * 인증 도메인 API
 * 로그인, 회원가입, 세션 관리
 */
import { API_CONFIG, ROUTE_PATHS } from '@/shared/config'
import apiClient from '@/shared/api/client'
import type {
  AuthSessionResponse,
  LoginRequest,
  SignupRequest,
  SocialAuthCallbackPayload,
  SocialAuthMode,
  SocialAuthProvider,
} from './types'

function getAppOrigin() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.origin
}

function getSocialCallbackUri(provider: SocialAuthProvider) {
  const origin = getAppOrigin()
  return `${origin}${ROUTE_PATHS.authCallback}/${provider}`
}

export const authApi = {
  login(payload: LoginRequest) {
    return apiClient.post<never, AuthSessionResponse>('/auth/login', payload)
  },
  signup(payload: SignupRequest) {
    return apiClient.post<never, AuthSessionResponse>('/auth/signup', payload)
  },
  getSocialAuthStartUrl(provider: SocialAuthProvider, mode: SocialAuthMode) {
    const url = new URL(`${API_CONFIG.baseURL}/auth/social/${provider}/start`)
    url.searchParams.set('mode', mode)
    url.searchParams.set('redirectUri', getSocialCallbackUri(provider))
    return url.toString()
  },
  exchangeSocialCode(payload: SocialAuthCallbackPayload) {
    return apiClient.post<never, AuthSessionResponse>(`/auth/social/${payload.provider}/callback`, payload)
  },
}
