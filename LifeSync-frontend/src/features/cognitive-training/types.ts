/**
 * 인지훈련 도메인 타입
 */

export type TrainingCategory = 'memory' | 'attention' | 'judgment' | 'language'

export interface TrainingGame {
  id: string
  name: string
  category: TrainingCategory
  difficulty: number
}

export interface GameResult {
  gameId: string
  score: number
  completedAt: string
  duration: number
  expGained: number; //경험치 획득
  coinsGained: number; //코인 획득
}

export interface UserPerference {
  fontSize: 'normal' | 'large' ;
  feedbackStyle: 'emotional' | 'statistical';
  guideMethod: 'voice' | 'visual';
}

export type GameStatus = 'READY' | 'PLAYING' | 'SUCCESS' | 'FAILED' ;

export interface TrainingHistory {
  id: string;
  date: string;
  gameName: string;
  score: number;
  rewardItem: string;
}

export interface TrainingParticipationSyncRequest {
  gameCategory: TrainingCategory
  gameName: string
  eventType: 'participated' | 'completed'
  occurredAt: string
  attendanceCandidate: boolean
  wateringChanceCandidate: boolean
  metadata?: Record<string, string | number | boolean>
}

export interface TrainingParticipationSyncResponse {
  attendanceMarked: boolean
  wateringChanceGranted: boolean
  dailyWateringChanceAvailable: boolean
}
