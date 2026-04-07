import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib'

interface ButtonBaseProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
}

type ButtonProps =
  | (ButtonBaseProps &
      ButtonHTMLAttributes<HTMLButtonElement> & {
        asLink?: false
        to?: never
      })
  | (ButtonBaseProps & {
      asLink: true
      to: string
    })

export function Button(props: ButtonProps) {
  const { children, className, variant = 'primary' } = props
  const classes = cn(variant === 'primary' ? 'btn-primary' : 'btn-secondary', className)

  if (props.asLink) {
    return (
      <Link className={classes} to={props.to}>
        {children}
      </Link>
    )
  }

  const { asLink: _asLink, to: _to, ...buttonProps } = props

  return (
    <button {...buttonProps} className={classes} type={props.type ?? 'button'}>
      {children}
    </button>
  )
}
