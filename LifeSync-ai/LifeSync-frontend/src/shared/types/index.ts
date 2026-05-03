/**
 * 전역 공통 타입
 */

export interface BaseResponse<T> {
  success: boolean
  data: T
  message?: string
  statusCode: number
}

export interface BaseError {
  code: string
  message: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}
