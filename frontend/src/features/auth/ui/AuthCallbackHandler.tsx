import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ROUTE_PATHS } from '@/shared/config'
import { SectionCard } from '@/shared/ui'
import { authApi } from '../api'
import { useAuth } from '../hooks'
import type { SocialAuthProvider } from '../types'

function isSocialProvider(value: string | undefined): value is SocialAuthProvider {
  return value === 'google' || value === 'kakao'
}

export function AuthCallbackHandler() {
  const navigate = useNavigate()
  const { provider } = useParams()
  const [searchParams] = useSearchParams()
  const { setSession } = useAuth()
  const [statusMessage, setStatusMessage] = useState('소셜 로그인 정보를 확인하고 있습니다.')

  useEffect(() => {
    async function handleCallback() {
      if (!isSocialProvider(provider)) {
        setStatusMessage('지원하지 않는 소셜 로그인 경로입니다.')
        return
      }

      const accessToken =
        searchParams.get('accessToken') ??
        searchParams.get('access_token') ??
        searchParams.get('token')

      if (accessToken) {
        setSession({
          accessToken,
          refreshToken: searchParams.get('refreshToken') ?? searchParams.get('refresh_token') ?? undefined,
        })
        navigate(ROUTE_PATHS.mypage, { replace: true })
        return
      }

      const code = searchParams.get('code')
      if (!code) {
        setStatusMessage('로그인 코드를 찾을 수 없습니다. 다시 시도해주세요.')
        return
      }

      try {
        setStatusMessage('백엔드에 로그인 정보를 요청하고 있습니다.')
        const session = await authApi.exchangeSocialCode({
          provider,
          code,
          state: searchParams.get('state'),
          redirectUri: `${window.location.origin}${ROUTE_PATHS.authCallback}/${provider}`,
        })

        setSession(session)
        navigate(ROUTE_PATHS.mypage, { replace: true })
      } catch {
        setStatusMessage('소셜 로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    }

    void handleCallback()
  }, [navigate, provider, searchParams, setSession])

  return (
    <SectionCard className="w-full max-w-2xl rounded-[28px] px-8 py-10 text-center">
      <div className="section-badge mx-auto">OAuth Callback</div>
      <h1 className="section-title mt-4">로그인 처리 중입니다.</h1>
      <p className="section-subtitle mt-4">{statusMessage}</p>
    </SectionCard>
  )
}
