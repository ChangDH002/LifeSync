import React from 'react';

export function InfoActionBanner() {
  return (
    // StyleGuide: 주요 CTA는 teal~primary 계열 사용, 시니어 친화적 거대 버튼
    <div className="w-full max-w-[800px] mx-auto bg-tealDark rounded-[24px] p-[30px] md:p-[40px] text-center shadow-lg mb-10">
      <h3 className="text-[28px] font-bold text-surface mt-0 mb-4 break-keep">
        나의 뇌 건강 상태가 궁금하신가요?
      </h3>
      <p className="text-[18px] text-primaryPale m-0 mb-8 break-keep">
        간단한 설문을 통해 치매 위험도를 자가진단해 보고,<br className="hidden md:block" /> 
        나에게 딱 맞는 맞춤형 인지훈련을 추천받으세요.
      </p>
      
      <button className="w-full md:w-auto bg-secondary hover:bg-[#b86d30] text-surface text-[20px] md:text-[22px] font-bold py-[16px] px-[40px] rounded-full border-none cursor-pointer transition-colors shadow-md">
        치매 위험도 자가진단 시작하기 ➔
      </button>
    </div>
  );
}