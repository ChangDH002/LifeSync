export interface RoutineItem {
  id: string
  title: string
  completed: boolean
}

export interface TodayRoutinesResponse {
  items: RoutineItem[]
}

export interface RoutineCompletionActionResponse {
  routineId: string
  date: string
  completed: boolean
  completedAt?: string | null
}
