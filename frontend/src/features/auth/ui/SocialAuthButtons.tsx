import type { SocialAuthMode, SocialAuthProvider } from '../types'
import { authApi } from '../api'
import googleSigninDesktop from '@/shared/assets/signin-assets/signin-assets/Web (mobile + desktop)/png@2x/light/web_light_sq_SI@2x.png'
import googleSigninMobile from '@/shared/assets/signin-assets/signin-assets/Web (mobile + desktop)/png@1x/light/web_light_sq_SI@1x.png'
import googleSignupDesktop from '@/shared/assets/signin-assets/signin-assets/Web (mobile + desktop)/png@2x/light/web_light_sq_SU@2x.png'
import googleSignupMobile from '@/shared/assets/signin-assets/signin-assets/Web (mobile + desktop)/png@1x/light/web_light_sq_SU@1x.png'
import kakaoLoginDesktop from '@/shared/assets/kakao_sync_login/complete/ko/kakao_login_large_narrow.png'
import kakaoLoginMobile from '@/shared/assets/kakao_sync_login/complete/ko/kakao_login_medium_narrow.png'

const providerMetadata: Record<
  SocialAuthProvider,
  {
    label: string
  }
> = {
  google: {
    label: 'Google로 계속하기',
  },
  kakao: {
    label: '카카오로 계속하기',
  },
}

interface SocialAuthButtonsProps {
  mode: SocialAuthMode
}

const googleButtonAssets: Record<
  SocialAuthMode,
  {
    desktop: string
    mobile: string
    alt: string
  }
> = {
  login: {
    desktop: googleSigninDesktop,
    mobile: googleSigninMobile,
    alt: 'Google 로그인',
  },
  signup: {
    desktop: googleSignupDesktop,
    mobile: googleSignupMobile,
    alt: 'Google 회원가입',
  },
}

export function SocialAuthButtons({ mode }: SocialAuthButtonsProps) {
  const handleStartSocialAuth = (provider: SocialAuthProvider) => {
    window.location.href = authApi.getSocialAuthStartUrl(provider, mode)
  }

  const googleButtonAsset = googleButtonAssets[mode]

  return (
    <div className="mt-6 flex flex-col items-center gap-3 sm:gap-4">
      <button
        aria-label={providerMetadata.kakao.label}
        className="block w-full max-w-[183px] appearance-none border-0 bg-transparent p-0 leading-none shadow-[0_10px_24px_rgba(14,41,35,0.08)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(14,41,35,0.12)] sm:max-w-[366px]"
        onClick={() => handleStartSocialAuth('kakao')}
        type="button"
      >
        <img
          alt="카카오 로그인"
          className="block h-auto w-full sm:hidden"
          src={kakaoLoginMobile}
        />
        <img
          alt="카카오 로그인"
          className="hidden h-auto w-full sm:block"
          src={kakaoLoginDesktop}
        />
      </button>

      <button
        aria-label={providerMetadata.google.label}
        className="block w-full max-w-[179px] appearance-none border-0 bg-transparent p-0 leading-none shadow-[0_10px_24px_rgba(14,41,35,0.08)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(14,41,35,0.12)] sm:max-w-[358px]"
        onClick={() => handleStartSocialAuth('google')}
        type="button"
      >
        <img
          alt={googleButtonAsset.alt}
          className="block h-auto w-full sm:hidden"
          src={googleButtonAsset.mobile}
        />
        <img
          alt={googleButtonAsset.alt}
          className="hidden h-auto w-full sm:block"
          src={googleButtonAsset.desktop}
        />
      </button>
    </div>
  )
}
