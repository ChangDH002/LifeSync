import { ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface SectionCardProps {
  children: ReactNode
  className?: string
}

export function SectionCard({ children, className }: SectionCardProps) {
  return <section className={cn('card', className)}>{children}</section>
}
