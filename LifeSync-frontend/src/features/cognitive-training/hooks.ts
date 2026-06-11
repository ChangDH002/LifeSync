import { useEffect } from 'react'
import { toast } from 'sonner'

interface ParticipationData {
  gameCategory: 'attention' | 'judgment' | 'language' | 'memory'
  gameName: string
  metadata: Record<string, unknown>
}

/**
 * 인지훈련 게임 완료 시 참여 기록을 서버에 전송하고,
 * 물주기 기회 획득 시 토스트 알림을 표시하는 커스텀 훅.
 * @param data - 게임 종류, 이름, 점수 등 메타데이터. null이면 아무 작업도 하지 않음.
 */
export function useTrainingParticipation(data: ParticipationData | null) {
  // data 객체가 렌더링마다 새로 생성될 수 있으므로, 내용을 JSON 문자열로 변환하여 의존성 배열에 사용
  const stableDataString = data ? JSON.stringify(data) : null

  useEffect(() => {
    if (!stableDataString) {
      return
    }

    const reportParticipation = async () => {
      const parsedData: ParticipationData = JSON.parse(stableDataString)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/training/participation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...parsedData,
            eventType: 'participated',
            occurredAt: new Date().toISOString(),
            wateringChanceCandidate: true,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.wateringChanceGranted) {
            toast.success('인지훈련 완료! 나무에 물을 줄 수 있게 되었어요. 🌳')
          }
        }
      } catch (error) {
        console.error('Failed to report training participation:', error)
      }
    }

    void reportParticipation()
  }, [stableDataString])
}