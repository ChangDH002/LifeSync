/**
 * 마이페이지 도메인 API
 * 사용자 정보, 활동 내역, 출석 캘린더, 보상
 */
import apiClient from '@/shared/api/client'
import type { MypageSummaryResponse } from './types'

export const mypageApi = {
  getSummary() {
    return apiClient.get<never, MypageSummaryResponse>('/mypage/summary')
  },
}
