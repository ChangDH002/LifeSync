/**
 * 인지훈련 도메인 Hook
 */
import { useRef, useState } from 'react'
import { cognitiveTrainingApi } from './api'
import type {
  TrainingCategory,
  TrainingParticipationSyncResponse,
} from './types'

interface UseTrainingActivityReporterOptions {
  gameCategory: TrainingCategory
  gameName: string
}

export const useTrainingActivityReporter = ({
  gameCategory,
  gameName,
}: UseTrainingActivityReporterOptions) => {
  const hasReportedCompletionRef = useRef(false)
  const [isReporting, setIsReporting] = useState(false)
  const [lastSyncResponse, setLastSyncResponse] = useState<TrainingParticipationSyncResponse | null>(
    null,
  )

  const reportCompletion = async (
    metadata?: Record<string, string | number | boolean>,
  ) => {
    if (hasReportedCompletionRef.current) {
      return lastSyncResponse
    }

    hasReportedCompletionRef.current = true
    setIsReporting(true)

    try {
      const response = await cognitiveTrainingApi.reportParticipation({
        gameCategory,
        gameName,
        eventType: 'completed',
        occurredAt: new Date().toISOString(),
        attendanceCandidate: true,
        wateringChanceCandidate: true,
        metadata,
      })

      setLastSyncResponse(response)
      return response
    } catch (error) {
      console.error('training participation sync failed', error)
      hasReportedCompletionRef.current = false
      return null
    } finally {
      setIsReporting(false)
    }
  }

  return {
    isReporting,
    lastSyncResponse,
    reportCompletion,
  }
}
