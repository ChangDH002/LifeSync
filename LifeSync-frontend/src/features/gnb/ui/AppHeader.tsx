import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { APP_CONFIG } from '@/shared/config'
import { PRIMARY_NAV_ITEMS } from '@/shared/constants'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'

export function AppHeader() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-base/95 shadow-[0_2px_16px_rgba(44,110,107,0.07)] backdrop-blur-xl">
      <div className="page-shell flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <NavLink className="flex items-center gap-3 font-serif text-[31px] font-black tracking-[-0.03em] text-tealDark" to="/">
            <span className="logo-mark h-12 w-12 text-[22px]">🌿</span>
            {APP_CONFIG.name}
          </NavLink>
          <p className="mt-2 max-w-[420px] text-[17px] font-medium leading-7 text-contentMid">
            {APP_CONFIG.description}
          </p>
        </div>
        <nav
          aria-label="주요 메뉴"
          className="flex flex-wrap items-center gap-1"
        >
          {PRIMARY_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) =>
                cn(
                  'nav-link',
                  isActive ? 'nav-link-active' : 'nav-link-idle'
                )
              }
              to={item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-wrap gap-3">
          {isAuthenticated ? (
            <>
              <Button asLink className="min-h-[54px] px-6 py-3 text-[18px] font-bold" to="/mypage" variant="secondary">
                마이페이지
              </Button>
              <Button className="min-h-[54px] px-6 py-3 text-[18px] font-bold" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button asLink className="min-h-[54px] px-6 py-3 text-[18px] font-bold" to="/login" variant="secondary">
                로그인
              </Button>
              <Button asLink className="min-h-[54px] px-6 py-3 text-[18px] font-bold" to="/login">
                회원가입
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
