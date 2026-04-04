/**
 * 인지훈련 도메인 타입
 */

export interface TrainingGame {
  id: string
  name: string
  category: 'memory' | 'attention' | 'judgment' | 'language'
  difficulty: number
}

export interface GameResult {
  gameId: string
  score: number
  completedAt: string
  duration: number
}
