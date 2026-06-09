import React from 'react';
import { DementiaSurvey } from '@/features/survey';

/**
 * 인지 건강 자가진단 페이지 컴포넌트
 */
export const SurveyPage = () => {
  return (
    <main className="min-h-screen bg-backgroundMin pt-24 pb-12 px-5">
      <div className="max-w-[800px] mx-auto">
        <header className="text-center mb-12 animate-fadeIn">
          <h1 className="text-[40px] font-bold text-tealDark mb-3">
            LifeSync 생활 리듬 체크
          </h1>
          <p className="text-[24px] text-contentMid break-keep leading-relaxed">
            최근 기억, 수면, 감정, 활동 흐름에서 어긋난 부분이 있는지 가볍게 점검해보세요.
          </p>
        </header>

        <section className="bg-surface rounded-[40px] shadow-sm p-2">
          <DementiaSurvey />
        </section>
      </div>
    </main>
  );
};

// export default SurveyPage;
