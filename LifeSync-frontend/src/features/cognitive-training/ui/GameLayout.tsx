import React from 'react'
import { ChevronLeft, Settings2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useViewportMode } from '@/shared/hooks'
import { cn } from '@/shared/lib'

interface GameLayoutProps {
  title: string
  description: string
  children: React.ReactNode
}

export function GameLayout({ title, description, children }: GameLayoutProps) {
  const navigate = useNavigate()
  const { isMobile, isWeb } = useViewportMode()

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <header
        className={cn(
          'sticky top-0 z-50 flex items-center justify-between border-b border-border bg-surface shadow-soft',
          isMobile ? 'h-16 px-4' : 'h-20 px-6'
        )}
      >
        <button
          aria-label="이전 화면으로 돌아가기"
          className={cn(
            'flex items-center gap-2 font-bold text-contentMid transition-transform active:scale-95',
            isMobile ? 'text-lg' : 'text-20px'
          )}
          onClick={() => navigate(-1)}
          type="button"
        >
          <ChevronLeft className={cn('text-primary', isMobile ? 'h-7 w-7' : 'h-8 w-8')} strokeWidth={2.4} />
          <span>뒤로</span>
        </button>
        <h1 className={cn('font-extrabold tracking-tight text-tealDark', isMobile ? 'text-xl' : 'text-28px')}>
          {title}
        </h1>

        <button
          aria-label="설정"
          className={cn('text-contentMid transition-transform active:rotate-45', isMobile ? 'p-2' : 'p-3')}
          type="button"
        >
          <Settings2 className={cn(isMobile ? 'h-6 w-6' : 'h-8 w-8')} strokeWidth={2.2} />
        </button>
      </header>

      <main
        className={cn(
          'flex flex-1 flex-col items-center justify-center',
          isMobile ? 'p-4' : isWeb ? 'p-10' : 'p-6'
        )}
      >
        <div
          className={cn(
            'w-full border border-border bg-surface shadow-soft',
            isMobile
              ? 'max-w-2xl rounded-[28px] p-5'
              : isWeb
                ? 'max-w-6xl rounded-[40px] p-12'
                : 'max-w-4xl rounded-[34px] p-8'
          )}
        >
          <div className={cn('text-center', isMobile ? 'mb-7' : 'mb-10')}>
            <h2 className={cn('font-black text-gray-900', isMobile ? 'text-2xl' : 'text-3xl md:text-4xl')}>
              {title}
            </h2>
            <p className={cn('mt-3 font-medium text-gray-500', isMobile ? 'text-base leading-7' : 'text-xl')}>
              {description}
            </p>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
