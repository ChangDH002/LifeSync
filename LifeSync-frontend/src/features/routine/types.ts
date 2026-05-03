export interface RoutineItem {
  id: string
  title: string
  completed: boolean
}

export interface TodayRoutinesResponse {
  items: RoutineItem[]
}
