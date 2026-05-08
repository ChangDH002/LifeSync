/**
 * 마이페이지 도메인 타입
 */

export interface AttendanceRecord {
  date: string
  attended: boolean
}

export interface Reward {
  id: string
  name: string
  description: string
  points: number
}
