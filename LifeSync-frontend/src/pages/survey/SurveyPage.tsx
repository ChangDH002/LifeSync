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
            인지 건강 자가진단
          </h1>
          <p className="text-[24px] text-contentMid break-keep leading-relaxed">
            최근 기억력이나 일상생활에서 느끼신 변화를 체크해보세요.
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