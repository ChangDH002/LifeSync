export interface RoutineItem {
  id: string
  title: string
  completed: boolean
  category?: 'exercise' | 'social' | 'sleep' | 'cognitive' | 'nutrition' | 'lifestyle'
  description?: string
  recommendationReason?: string
  frequency?: 'daily' | 'weekly' | 'custom'
  priority?: number
  active: boolean
}

export interface TodayRoutinesResponse {
  items: RoutineItem[]
}