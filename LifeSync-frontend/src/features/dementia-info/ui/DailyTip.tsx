import React from 'react';

export function DailyTip() {
  return (
    // StyleGuide: 시니어 친화적 여백, 부드러운 surface 배경과 primary 경계선 활용
    <div className="w-full max-w-[800px] mx-auto bg-surface border-2 border-primaryPale rounded-[20px] p-[24px] md:p-[30px] shadow-sm flex flex-col md:flex-row items-start gap-4 mb-12">
      <div className="text-[40px] md:text-[50px] leading-none">💡</div>
      <div>
        <h3 className="mt-0 mb-2 text-[22px] font-bold text-tealDark">
          오늘의 뇌 건강 꿀팁
        </h3>
        <p className="m-0 text-[18px] leading-[1.7] text-contentMid break-keep">
          하루 30분씩 가볍게 걷는 것만으로도 뇌 혈류량이 늘어나 기억력 감퇴를 막을 수 있습니다. 
          오늘 저녁 식사 후, 무리하지 않는 선에서 동네를 한 바퀴 걸어보는 건 어떨까요?
        </p>
      </div>
    </div>
  );
}