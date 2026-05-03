/**
 * 마이페이지 도메인 타입
 */

export type MypageTabKey = 'survey' | 'routine' | 'training'

export type MypageActivityType = 'routine' | 'training' | 'survey' | 'general'

export interface MypageUserProfile {
  id: string
  name: string
  email: string
  joinedLabel: string
}

export interface MypageSurveyBanner {
  needsUpdate: boolean
  bannerTitle: string
  bannerDescription: string
}

export interface MypageSummaryMetrics {
  streakDays: number
  todayRoutineCompleted: number
  todayRoutineTotal: number
  weeklyAchievementRate: number
  trainingCompletedCount: number
}

export interface MypageActivity {
  title: string
  detail: string
  type: MypageActivityType
}

export interface MypageTabSection {
  heading: string
  description: string
  bullets: string[]
}

export interface MypageSummaryResponse {
  user: MypageUserProfile
  survey: MypageSurveyBanner
  summary: MypageSummaryMetrics
  recentActivities: MypageActivity[]
  tabs: Record<MypageTabKey, MypageTabSection>
}
