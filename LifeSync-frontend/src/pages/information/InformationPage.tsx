import { DementiaInfoPreview, DementiaInfoSlider } from '@/features/dementia-info';
import { AppFooter } from '@/features/footer';
import { AppHeader } from '@/features/gnb';
import { SectionCard } from '@/shared/ui';

// 우리가 방금 새로 만든 3가지 컴포넌트 불러오기!
import { DailyTip } from '@/features/dementia-info/ui/DailyTip';
import { InfoFAQ } from '@/features/dementia-info/ui/InfoFAQ';
import { InfoActionBanner } from '@/features/dementia-info/ui/InfoActionBanner';

export function InformationPage() {
  return (
    <main className="min-h-screen bg-base">
      {/* 상단 네비게이션 바 (유지) */}
      <AppHeader />
      
      <div className="page-shell flex flex-col gap-6 py-12">
        {/* 기존 소개 카드 (유지) */}
        <SectionCard>
          <div className="section-badge">예방 정보</div>
          <h1 className="section-title mt-4">인지 건강 정보</h1>
          <p className="section-subtitle mt-3">
            꼭 필요한 정보만 우선 보여주고, 긴 문장보다 짧고 분명한 안내를 구성하는 페이지입니다.
          </p>
        </SectionCard>

        {/* ✨ 1. 우리가 추가한 오늘의 꿀팁 */}
        <DailyTip />

        {/* 기존 프리뷰 (유지) */}
        <DementiaInfoPreview />

        {/* 2. 메인 슬라이더 (우리가 수정한 거!) */}
        <DementiaInfoSlider />

        {/* ✨ 3. 우리가 추가한 자주 묻는 질문 */}
        <InfoFAQ />

        {/* ✨ 4. 우리가 추가한 액션 유도 배너 */}
        <InfoActionBanner />
      </div>

      {/* 하단 푸터 (유지) */}
      <AppFooter />
    </main>
  );
}