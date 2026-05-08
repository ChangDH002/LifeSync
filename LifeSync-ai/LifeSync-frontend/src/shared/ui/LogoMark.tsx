import { Brain } from 'lucide-react'
import { cn } from '@/shared/lib'

interface LogoMarkProps {
  className?: string
  iconClassName?: string
}

export function LogoMark({ className, iconClassName }: LogoMarkProps) {
  return (
    <span className={cn('logo-mark', className)}>
      <Brain className={cn('h-5 w-5', iconClassName)} strokeWidth={2.2} />
    </span>
  )
}
