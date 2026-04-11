import { AttentionGame } from '@/features/cognitive-training/attention';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AttentionGamePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-surface pb-20">
      {/* 상단바: 일관된 레이아웃 유지 */}
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
            집중력 강화 훈련
          </h1>
          {/* 11.5: 시각적 피로도를 줄이는 부드러운 설명 문구 */}
          <p className="mt-3 text-xl font-medium text-gray-500">
            반짝이는 순서를 기억하고 그대로 따라 누르세요!
          </p>
        </div>

        {/* Feature 컴포넌트 배치 */}
        <AttentionGame />
      </section>
    </main>
  );
}