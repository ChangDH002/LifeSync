/**
 * 아바타 도메인 API
 * 아바타, 상점, 옷장, 장착
 */
import apiClient from '@/shared/api/client'
import type { Avatar, WaterTreeResponse } from './types'

export const avatarApi = {
  getMyAvatar() {
    return apiClient.get<never, Avatar>('/avatar/me')
  },
  waterTree() {
    return apiClient.post<never, WaterTreeResponse>('/avatar/water')
  },
}
