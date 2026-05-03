import { useSyncExternalStore } from 'react'
import type { AuthSessionResponse } from './types'

const AUTH_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const AUTH_EVENT_NAME = 'lifesync-auth-change'

function subscribe(callback: () => void) {
  const handler = () => callback()

  window.addEventListener('storage', handler)
  window.addEventListener(AUTH_EVENT_NAME, handler)

  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(AUTH_EVENT_NAME, handler)
  }
}

function getSnapshot() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

function emitAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT_NAME))
}

export function useAuth() {
  const token = useSyncExternalStore(subscribe, getSnapshot, () => null)

  return {
    isAuthenticated: Boolean(token),
    token,
    login(nextToken: string) {
      localStorage.setItem(AUTH_TOKEN_KEY, nextToken)
      emitAuthChange()
    },
    setSession(session: AuthSessionResponse) {
      localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken)

      if (session.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
      }

      emitAuthChange()
    },
    logout() {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      emitAuthChange()
    },
  }
}
