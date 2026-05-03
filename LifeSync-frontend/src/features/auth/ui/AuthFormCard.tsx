import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark, SectionCard } from '@/shared/ui'

interface AuthFormCardProps {
  badge: string
  title: string
  description: string
  footerPrompt: string
  footerLinkLabel: string
  footerLinkTo: string
  children: ReactNode
}

export function AuthFormCard({
  badge,
  title,
  description,
  footerPrompt,
  footerLinkLabel,
  footerLinkTo,
  children,
}: AuthFormCardProps) {
  return (
    <SectionCard className="w-full max-w-2xl rounded-[28px] px-8 py-10">
      <div className="mb-8 flex items-center gap-3 font-serif text-2xl font-black tracking-[-0.02em] text-tealDark">
        <LogoMark />
        LifeSync
      </div>
      <div className="section-badge">{badge}</div>
      <h1 className="section-title mt-4">{title}</h1>
      <p className="section-subtitle mt-3 max-w-[620px]">{description}</p>
      {children}
      <p className="mt-8 text-base text-contentMid">
        {footerPrompt}{' '}
        <Link className="font-semibold text-primary underline underline-offset-4" to={footerLinkTo}>
          {footerLinkLabel}
        </Link>
      </p>
    </SectionCard>
  )
}
