import { JudgmentGame } from '@/features/cognitive-training/judgment';
import { ChevronLeft } from 'lucide-react'; // 아이콘 라이브러리 가정
import { useNavigate } from 'react-router-dom';

export default function JudgmentGamePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-surface pb-20">
      {/* 네비게이션 및 뒤로가기 제공 */}
      <header className="sticky top-0 z-10 flex items-center bg-white px-4 py-4 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xl font-bold text-gray-700 active:scale-95"
          aria-label="이전 화면으로 돌아가기"
        >
          <ChevronLeft size={32} className="text-primary" />
          <span>뒤로가기</span>
        </button>
      </header>

      <section className="container mx-auto mt-8 px-4">
        {/* 제목 (Headline) */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-gray-900 md:text-4xl">
            상황 판단력 훈련
          </h1>
          <p className="mt-3 text-xl font-medium text-gray-500">
            일상생활 속 올바른 선택을 연습해 보세요.
          </p>
        </div>

        {/* Feature 컴포넌트 배치 */}
        <JudgmentGame />
      </section>
    </main>
  );
}