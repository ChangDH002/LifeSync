/**
 * 아바타 도메인 타입
 */

export type TreeType = 'ginkgo' | 'zelkova' | 'pine'

export interface Avatar {
  id: string
  name: string
  level: number
  experience: number
  maxExperience: number
  waterCount: number
  stage: number
  maxStage: number
  treeType: TreeType
}

export interface AvatarItem {
  id: string
  name: string
  type: 'clothing' | 'accessory'
  price: number
}

export interface TreeStageAsset {
  stage: number
  imageSrc: string
  title: string
  description: string
}
