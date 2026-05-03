import { GameLayout } from '@/features/cognitive-training'
import { JudgmentGame } from '@/features/cognitive-training/judgment'

export default function JudgmentGamePage() {
  return (
    <GameLayout title="상황 판단력 훈련" description="일상생활 속 올바른 선택을 연습해 보세요.">
      <section className="container mx-auto px-4">
        <JudgmentGame />
      </section>
    </GameLayout>
  )
}
