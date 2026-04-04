/**
 * 아바타 도메인 타입
 */

export interface Avatar {
  id: string
  name: string
  level: number
  experience: number
}

export interface AvatarItem {
  id: string
  name: string
  type: 'clothing' | 'accessory'
  price: number
}
