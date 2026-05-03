/**
 * GNB 도메인 타입
 */

export interface MenuItem {
  id: string
  label: string
  path: string
}

export interface GnbMenuItem extends MenuItem {
  isActive: boolean
}

export interface GnbProfileResponse {
  id?: string
  email?: string | null
  name?: string | null
  username?: string | null
}

export interface GnbProfile {
  id: string
  displayName: string
  email: string | null
}

export interface GnbViewModel {
  appName: string
  description: string
  menuItems: GnbMenuItem[]
  isAuthenticated: boolean
  isProfileLoading: boolean
  profile: GnbProfile | null
  loginPath: string
  signupPath: string
  mypagePath: string
  handleLogout: () => Promise<void>
}
