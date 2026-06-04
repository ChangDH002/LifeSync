import { GameLayout } from '@/features/cognitive-training'
import { CardFlipGame } from '@/features/cognitive-training/memory'

export function MemoryGamePage() {
  return (
    <GameLayout title="기억력 훈련" description="카드 짝을 맞추며 기억력을 천천히 깨워보세요.">
      <section className="container mx-auto px-4">
        <CardFlipGame />
      </section>
    </GameLayout>
  )
}
