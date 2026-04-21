import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib'
import { Button, LogoMark } from '@/shared/ui'
import { useGnb } from '../hooks'

export function AppHeader() {
  const {
    appName,
    description,
    menuItems,
    isAuthenticated,
    isProfileLoading,
    profile,
    loginPath,
    signupPath,
    mypagePath,
    handleLogout,
  } = useGnb()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-base/95 shadow-[0_2px_16px_rgba(44,110,107,0.07)] backdrop-blur-xl">
      <div className="page-shell flex flex-col gap-5 py-5 lg:grid lg:grid-cols-[minmax(280px,360px)_1fr_auto] lg:items-center lg:gap-6">
        <div className="min-w-0">
          <NavLink className="flex items-center gap-3 font-serif text-[31px] font-black tracking-[-0.03em] text-tealDark" to="/">
            <LogoMark className="h-12 w-12" iconClassName="h-[22px] w-[22px]" />
            {appName}
          </NavLink>
          <p className="mt-2 max-w-[420px] text-[17px] font-medium leading-7 text-contentMid lg:leading-6">
            {description}
          </p>
        </div>
        <nav
          aria-label="주요 메뉴"
          className="flex flex-wrap items-center gap-1 lg:min-w-0 lg:flex-nowrap lg:justify-center"
        >
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              className={() =>
                cn(
                  'nav-link',
                  item.isActive ? 'nav-link-active' : 'nav-link-idle'
                )
              }
              to={item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col gap-2 lg:items-end">
          {isAuthenticated ? (
            <>
              <div className="hidden text-[15px] font-semibold tracking-[-0.01em] text-contentMid xl:block">
                {isProfileLoading ? '사용자 정보 불러오는 중...' : `${profile?.displayName || '회원'}님`}
              </div>
              <div className="flex flex-wrap gap-3 lg:flex-nowrap lg:justify-end">
              <Button asLink className="min-h-[54px] px-6 py-3 text-[18px] font-bold" to={mypagePath} variant="secondary">
                마이페이지
              </Button>
              <Button className="min-h-[54px] px-6 py-3 text-[18px] font-bold" onClick={() => void handleLogout()}>
                로그아웃
              </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-3 lg:flex-nowrap lg:justify-end">
              <Button asLink className="min-h-[54px] px-6 py-3 text-[18px] font-bold" to={loginPath} variant="secondary">
                로그인
              </Button>
              <Button asLink className="min-h-[54px] px-6 py-3 text-[18px] font-bold" to={signupPath}>
                회원가입
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
