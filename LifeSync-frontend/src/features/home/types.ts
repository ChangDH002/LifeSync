import type { LucideIcon } from 'lucide-react'

export interface HomeFeatureCard {
  icon: LucideIcon
  title: string
  body: string
  to: string
}

export interface HomeInfoCard {
  title: string
  body: string
}
