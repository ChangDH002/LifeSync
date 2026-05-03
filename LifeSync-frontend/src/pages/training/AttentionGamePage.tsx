import { AttentionGame } from '@/features/cognitive-training/attention'
import { GameLayout } from '@/features/cognitive-training'

export default function AttentionGamePage() {
  return (
    <GameLayout title="집중력 강화 훈련" description="반짝이는 순서를 기억하고 그대로 따라 누르세요!">
      <section className="container mx-auto px-4">
        <AttentionGame />
      </section>
    </GameLayout>
  )
}
