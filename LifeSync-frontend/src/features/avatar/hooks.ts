/**
 * 아바타 도메인 Hook
 */

import { useEffect, useState } from 'react'
import ginkgoStage1 from '@/shared/assets/trees/ginkgo/ginkgo (1).svg'
import ginkgoStage2 from '@/shared/assets/trees/ginkgo/ginkgo (2).svg'
import ginkgoStage3 from '@/shared/assets/trees/ginkgo/ginkgo (3).svg'
import ginkgoStage4 from '@/shared/assets/trees/ginkgo/ginkgo (4).svg'
import ginkgoStage5 from '@/shared/assets/trees/ginkgo/ginkgo (5).svg'
import ginkgoStage6 from '@/shared/assets/trees/ginkgo/ginkgo (6).svg'
import { avatarApi } from './api'
import type { Avatar, TreeStageAsset } from './types'

const GINKGO_STAGE_ASSETS: TreeStageAsset[] = [
  {
    stage: 1,
    imageSrc: ginkgoStage1,
    title: '초록 새싹',
    description: '작은 관심이 처음 뿌리내리는 단계예요. 오늘의 물주기가 건강한 변화를 시작하게 도와줍니다.',
  },
  {
    stage: 2,
    imageSrc: ginkgoStage2,
    title: '은행나무 초목',
    description: '생활 리듬이 천천히 살아나고 있어요. 짧은 실천도 꾸준히 이어가면 다음 성장이 가까워집니다.',
  },
  {
    stage: 3,
    imageSrc: ginkgoStage3,
    title: '어린 은행나무',
    description: '기억을 돌보는 습관이 자리를 잡기 시작했어요. 지금의 흐름을 유지하면 나무가 더 단단해집니다.',
  },
  {
    stage: 4,
    imageSrc: ginkgoStage4,
    title: '성장하는 은행나무',
    description: '루틴과 활동이 고르게 쌓이며 성장의 중심이 만들어지고 있어요. 오늘의 실천이 내일의 안정감을 만듭니다.',
  },
  {
    stage: 5,
    imageSrc: ginkgoStage5,
    title: '무성한 은행나무',
    description: '꾸준함이 눈에 보이는 성과로 이어지고 있어요. 조금만 더 돌보면 가장 완성된 단계에 도달할 수 있어요.',
  },
  {
    stage: 6,
    imageSrc: ginkgoStage6,
    title: '기억의 은행나무',
    description: '매일의 돌봄이 아름답게 쌓여 가장 안정적인 성장 단계에 도달했어요. 이제 건강한 리듬을 오래 지켜가면 됩니다.',
  },
]

const EXPERIENCE_PER_WATER = 20
const EXPERIENCE_PER_STAGE = 100
const MAX_STAGE = GINKGO_STAGE_ASSETS.length
const MAX_EXPERIENCE = EXPERIENCE_PER_STAGE * (MAX_STAGE - 1)

const INITIAL_AVATAR: Avatar = {
  id: 'tree-ginkgo',
  name: '은행나무',
  level: 1,
  experience: 0,
  maxExperience: MAX_EXPERIENCE,
  waterCount: 0,
  stage: 1,
  maxStage: MAX_STAGE,
  treeType: 'ginkgo',
  dailyWateringChanceAvailable: true,
}

function normalizeAvatar(payload: Partial<Avatar>): Avatar {
  return {
    ...INITIAL_AVATAR,
    ...payload,
    stage: Math.min(Math.max(payload.stage ?? INITIAL_AVATAR.stage, 1), MAX_STAGE),
    maxStage: payload.maxStage ?? MAX_STAGE,
    maxExperience: payload.maxExperience ?? MAX_EXPERIENCE,
    dailyWateringChanceAvailable: payload.dailyWateringChanceAvailable ?? true,
    level: payload.level ?? payload.stage ?? INITIAL_AVATAR.level,
  }
}

function applyLocalWatering(currentAvatar: Avatar) {
  const nextExperience = Math.min(currentAvatar.experience + EXPERIENCE_PER_WATER, currentAvatar.maxExperience)
  const nextStage = Math.min(
    Math.floor(nextExperience / EXPERIENCE_PER_STAGE) + 1,
    currentAvatar.maxStage,
  )

  return {
    ...currentAvatar,
    experience: nextExperience,
    waterCount: currentAvatar.waterCount + 1,
    stage: nextStage,
    level: nextStage,
  }
}

export const useAvatar = () => {
  const [avatar, setAvatar] = useState<Avatar>(INITIAL_AVATAR)
  const [isLoading, setIsLoading] = useState(true)
  const [isRemoteMode, setIsRemoteMode] = useState(false)
  const [isWatering, setIsWatering] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadAvatar() {
      try {
        const response = await avatarApi.getMyAvatar()

        if (!isMounted) {
          return
        }

        const nextAvatar = normalizeAvatar(response)
        setAvatar(nextAvatar)
        setIsRemoteMode(true)
        setStatusMessage(
          nextAvatar.dailyWateringChanceAvailable === false
            ? '오늘 물주기 기회를 모두 사용했어요.'
            : '백엔드에 저장된 나무 상태를 불러왔어요.',
        )
        setError(null)
      } catch (loadError) {
        console.error('avatar fetch failed', loadError)

        if (!isMounted) {
          return
        }

        setAvatar(INITIAL_AVATAR)
        setIsRemoteMode(false)
        setStatusMessage('백엔드 연결 전까지 프론트 성장 로직으로 보여드리고 있어요.')
        setError(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadAvatar()

    return () => {
      isMounted = false
    }
  }, [])

  const waterTree = async () => {
    if (isWatering || isLoading) {
      return
    }

    if (isRemoteMode && avatar.dailyWateringChanceAvailable === false) {
      setStatusMessage('오늘은 이미 물주기를 완료했어요.')
      return
    }

    setIsWatering(true)
    setError(null)

    if (!isRemoteMode) {
      setAvatar((currentAvatar) => applyLocalWatering(currentAvatar))
      setStatusMessage('로컬 성장 모드로 물주기를 반영했어요.')
      setIsWatering(false)
      return
    }

    try {
      const response = await avatarApi.waterTree()
      setAvatar(normalizeAvatar(response.avatar))
      setStatusMessage(
        response.used
          ? `${response.expGained} XP가 반영되었어요.`
          : '오늘은 이미 물주기를 완료했어요.',
      )
    } catch (wateringError) {
      console.error('avatar watering failed', wateringError)
      setError('물주기 결과를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsWatering(false)
    }
  }

  const currentStageAsset =
    GINKGO_STAGE_ASSETS.find((asset) => asset.stage === avatar.stage) ?? GINKGO_STAGE_ASSETS[0]

  const nextStageExperienceGoal =
    avatar.stage >= avatar.maxStage ? avatar.maxExperience : avatar.stage * EXPERIENCE_PER_STAGE

  const currentStageFloor = (avatar.stage - 1) * EXPERIENCE_PER_STAGE
  const stageProgress = avatar.experience - currentStageFloor
  const progressWithinStage =
    avatar.stage >= avatar.maxStage
      ? 100
      : Math.min((stageProgress / EXPERIENCE_PER_STAGE) * 100, 100)

  return {
    avatar,
    canWaterToday: isRemoteMode ? avatar.dailyWateringChanceAvailable !== false : true,
    currentStageAsset,
    error,
    isLoading,
    isMaxStage: avatar.stage >= avatar.maxStage,
    isRemoteMode,
    isWatering,
    nextStageExperienceGoal,
    progressWithinStage,
    stageAssets: GINKGO_STAGE_ASSETS,
    statusMessage,
    waterTree,
  }
}
