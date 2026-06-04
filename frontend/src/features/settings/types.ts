/**
 * 설정 도메인 타입
 */

export interface UserSettings {
  fontSize: 'small' | 'medium' | 'large'
  notificationsEnabled: boolean
  darkMode: boolean
}
