import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { ROUTE_PATHS } from '@/shared/config'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={ROUTE_PATHS.login} />
  }

  return <>{children}</>
}
