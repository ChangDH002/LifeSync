import { NavLink } from 'react-router-dom'
import { APP_CONFIG } from '@/shared/config'
import { PRIMARY_NAV_ITEMS } from '@/shared/constants'
import { cn } from '@/shared/lib'

export function AppHeader() {
  return (
    <header className="border-b border-primary/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <NavLink className="text-2xl font-bold text-primary" to="/">
            {APP_CONFIG.name}
          </NavLink>
          <p className="mt-1 text-sm text-content/70">{APP_CONFIG.description}</p>
        </div>
        <nav aria-label="주요 메뉴" className="flex flex-wrap gap-2">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-base font-medium transition-colors',
                  isActive ? 'bg-primary text-white' : 'bg-primary/5 text-content hover:bg-primary/10'
                )
              }
              to={item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
