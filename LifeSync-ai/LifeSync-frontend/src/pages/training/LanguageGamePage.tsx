import { LanguageGame } from '@/features/cognitive-training/language';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LanguageGamePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-surface pb-20">
      <header className="sticky top-0 z-10 flex items-center bg-white px-4 py-4 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xl font-bold text-gray-700 active:scale-95"
        >
          <ChevronLeft size={32} className="text-primary" />
          <span>뒤로가기</span>
        </button>
      </header>

      <section className="container mx-auto mt-8 px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-gray-900 md:text-4xl">
            언어·인지 훈련
          </h1>
          <p className="mt-3 text-xl font-medium text-gray-500">
            글자를 조합해서 맛있는 단어를 완성해 보세요!
          </p>
        </div>

        <LanguageGame />
      </section>
    </main>
  );
}