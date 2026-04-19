/**
 * 아바타 도메인 Hook
 */

import { useState } from 'react'
import ginkgoStage1 from '@/shared/assets/trees/ginkgo/ginkgo (1).svg'
import ginkgoStage2 from '@/shared/assets/trees/ginkgo/ginkgo (2).svg'
import ginkgoStage3 from '@/shared/assets/trees/ginkgo/ginkgo (3).svg'
import ginkgoStage4 from '@/shared/assets/trees/ginkgo/ginkgo (4).svg'
import ginkgoStage5 from '@/shared/assets/trees/ginkgo/ginkgo (5).svg'
import ginkgoStage6 from '@/shared/assets/trees/ginkgo/ginkgo (6).svg'
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
}

export const useAvatar = () => {
  const [avatar, setAvatar] = useState<Avatar>(INITIAL_AVATAR)

  const waterTree = () => {
    setAvatar((currentAvatar) => {
      const nextExperience = Math.min(
        currentAvatar.experience + EXPERIENCE_PER_WATER,
        currentAvatar.maxExperience,
      )
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
    })
  }

  const currentStageAsset =
    GINKGO_STAGE_ASSETS.find((asset) => asset.stage === avatar.stage) ?? GINKGO_STAGE_ASSETS[0]

  const nextStageExperienceGoal =
    avatar.stage >= avatar.maxStage ? avatar.maxExperience : avatar.stage * EXPERIENCE_PER_STAGE

  const currentStageFloor = (avatar.stage - 1) * EXPERIENCE_PER_STAGE
  const currentStageSpan = avatar.stage >= avatar.maxStage ? EXPERIENCE_PER_STAGE : EXPERIENCE_PER_STAGE
  const stageProgress = avatar.experience - currentStageFloor
  const progressWithinStage =
    avatar.stage >= avatar.maxStage
      ? 100
      : Math.min((stageProgress / currentStageSpan) * 100, 100)

  return {
    avatar,
    currentStageAsset,
    isMaxStage: avatar.stage >= avatar.maxStage,
    nextStageExperienceGoal,
    progressWithinStage,
    stageAssets: GINKGO_STAGE_ASSETS,
    waterTree,
  }
}
