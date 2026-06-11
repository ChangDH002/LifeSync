import type { icons } from 'lucide-react'

export interface MemoryCard {
  id: string
  /** lucide-react 아이콘 이름 */
  iconName: keyof typeof icons
}

/**
 * 카드 뒤집기 게임에 사용할 수 있는 아이콘 목록입니다.
 * 오픈소스 아이콘 라이브러리(lucide-react)에서 가져왔습니다.
 */
const fullIconSet: MemoryCard[] = [
  { id: 'apple', iconName: 'Apple' },
  { id: 'banana', iconName: 'Banana' },
  { id: 'grapes', iconName: 'Grapes' },
  { id: 'cherry', iconName: 'Cherry' },
  { id: 'carrot', iconName: 'Carrot' },
  { id: 'egg', iconName: 'Egg' },
  { id: 'home', iconName: 'Home' },
  { id: 'tree-pine', iconName: 'TreePine' },
  { id: 'flower', iconName: 'Flower' },
  { id: 'sun', iconName: 'Sun' },
  { id: 'moon', iconName: 'Moon' },
  { id: 'star', iconName: 'Star' },
  { id: 'cloud', iconName: 'Cloud' },
  { id: 'heart', iconName: 'Heart' },
  { id: 'bone', iconName: 'Bone' },
  { id: 'bird', iconName: 'Bird' },
  { id: 'cat', iconName: 'Cat' },
  { id: 'dog', iconName: 'Dog' },
  { id: 'fish', iconName: 'Fish' },
  { id: 'ship', iconName: 'Ship' },
  { id: 'car', iconName: 'Car' },
  { id: 'bus', iconName: 'Bus' },
  { id: 'bike', iconName: 'Bike' },
  { id: 'plane', iconName: 'Plane' },
  // --- 아래는 난이도 향상을 위해 추가된 아이콘 ---
  { id: 'anchor', iconName: 'Anchor' },
  { id: 'award', iconName: 'Award' },
  { id: 'bell', iconName: 'Bell' },
  { id: 'bomb', iconName: 'Bomb' },
  { id: 'book', iconName: 'Book' },
  { id: 'box', iconName: 'Box' },
  { id: 'briefcase', iconName: 'Briefcase' },
  { id: 'cake', iconName: 'Cake' },
  { id: 'camera', iconName: 'Camera' },
  { id: 'candle', iconName: 'Candle' },
  { id: 'castle', iconName: 'Castle' },
  { id: 'key', iconName: 'Key' },
]

/**
 * 게임 한 판에 사용할 카드 세트를 무작위로 생성합니다.
 * @param pairCount - 생성할 카드 쌍의 개수 (예: 8쌍이면 16개 카드)
 */
export function getCardSetForGame(pairCount: number): MemoryCard[] {
  const shuffled = [...fullIconSet].sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, pairCount)
  const pairs = [...selected, ...selected] // 쌍으로 만들기
  return pairs.sort(() => 0.5 - Math.random()) // 최종 섞기
}