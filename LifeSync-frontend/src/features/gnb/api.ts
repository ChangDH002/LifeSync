/**
 * GNB 도메인 API
 * 로고, 메뉴, 로그인 상태 영역
 */

import apiClient from '@/shared/api/client'
import type { GnbProfileResponse } from './types'

export const gnbApi = {
  getProfile() {
    return apiClient.get<never, GnbProfileResponse>('/auth/me')
  },
  logout() {
    return apiClient.post<never, void>('/auth/logout')
  },
}
