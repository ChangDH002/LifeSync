/**
 * 인증 도메인 타입
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string
}

export type SocialAuthProvider = 'google' | 'kakao'

export type SocialAuthMode = 'login' | 'signup'

export interface SocialAuthCallbackPayload {
  provider: SocialAuthProvider
  code: string
  state?: string | null
  redirectUri: string
}

export interface AuthSessionResponse {
  accessToken: string
  refreshToken?: string
  user?: User
}
