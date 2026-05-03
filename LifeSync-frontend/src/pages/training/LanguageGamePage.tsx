import { GameLayout } from '@/features/cognitive-training'
import { LanguageGame } from '@/features/cognitive-training/language'

export function LanguageGamePage() {
  return (
    <GameLayout title="언어·인지 훈련" description="글자를 조합해서 익숙한 단어를 완성해 보세요!">
      <section className="container mx-auto px-4">
        <LanguageGame />
      </section>
    </GameLayout>
  )
}
