/**
 * GNB 도메인 Hook
 */

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { gnbApi } from './api'
import type { GnbMenuItem, GnbProfile, GnbProfileResponse, GnbViewModel } from './types'
import { APP_CONFIG, ROUTE_PATHS } from '@/shared/config'
import { PRIMARY_NAV_ITEMS } from '@/shared/constants'

function getDisplayName(profile: GnbProfileResponse) {
  const preferredName = profile.name?.trim() || profile.username?.trim()

  if (preferredName) {
    return preferredName
  }

  const emailPrefix = profile.email?.split('@')[0]?.trim()
  return emailPrefix || '회원'
}

function normalizeProfile(profile: GnbProfileResponse): GnbProfile {
  return {
    id: profile.id || profile.email || getDisplayName(profile),
    displayName: getDisplayName(profile),
    email: profile.email ?? null,
  }
}

export const useGnb = (): GnbViewModel => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [profile, setProfile] = useState<GnbProfile | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null)
      setIsProfileLoading(false)
      return
    }

    let isMounted = true

    const fetchProfile = async () => {
      setIsProfileLoading(true)

      try {
        const response = await gnbApi.getProfile()

        if (!isMounted) {
          return
        }

        setProfile(normalizeProfile(response))
      } catch {
        if (!isMounted) {
          return
        }

        setProfile(null)
      } finally {
        if (isMounted) {
          setIsProfileLoading(false)
        }
      }
    }

    void fetchProfile()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  const menuItems: GnbMenuItem[] = PRIMARY_NAV_ITEMS.map((item) => ({
    id: item.path.replace(/\//g, '') || 'home',
    label: item.label,
    path: item.path,
    isActive: location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
  }))

  const handleLogout = async () => {
    try {
      await gnbApi.logout()
    } catch {
      // 백엔드 미연결 단계에서도 로컬 세션 정리는 계속 진행합니다.
    }

    logout()
    setProfile(null)
    navigate(ROUTE_PATHS.home)
  }

  return {
    appName: APP_CONFIG.name,
    description: APP_CONFIG.description,
    menuItems,
    isAuthenticated,
    isProfileLoading,
    profile,
    loginPath: ROUTE_PATHS.login,
    signupPath: ROUTE_PATHS.signup,
    mypagePath: ROUTE_PATHS.mypage,
    handleLogout,
  }
}
