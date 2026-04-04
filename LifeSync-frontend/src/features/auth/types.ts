/**
 * 인증 도메인 타입
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string
}
