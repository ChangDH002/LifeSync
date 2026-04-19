import React, { useState } from 'react';

const faqData = [
  {
    q: "건망증과 치매는 어떻게 다른가요?",
    a: "건망증은 힌트를 주면 금방 기억해 내지만, 치매는 사건이 있었다는 사실 자체를 까맣게 잊어버리는 경우가 많습니다."
  },
  {
    q: "가족 중에 치매 환자가 있으면 저도 걸리나요?",
    a: "유전적 확률이 일부 있지만 무조건 유전되는 것은 아닙니다. 건강한 식습관, 운동, 활발한 소통으로 충분히 예방할 수 있습니다."
  },
  {
    q: "인지훈련 게임은 매일 해야 하나요?",
    a: "네, 뇌도 근육과 같아서 꾸준히 자극을 주는 것이 중요합니다. 하루 15분씩이라도 매일 즐겁게 참여하시는 것을 권장합니다."
  }
];

export function InfoFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // 첫 번째는 기본으로 열어둠

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-[800px] mx-auto mb-16">
      <h3 className="text-[28px] font-bold text-tealDark mb-6 text-center">
        자주 묻는 질문
      </h3>
      
      <div className="flex flex-col gap-4">
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`border-2 rounded-[16px] overflow-hidden transition-colors duration-300 ${isOpen ? 'border-primary bg-surface shadow-sm' : 'border-border bg-surface hover:border-primaryLight'}`}
            >
              <button 
                className="w-full text-left px-[24px] py-[20px] flex justify-between items-center cursor-pointer bg-transparent border-none"
                onClick={() => toggleFAQ(index)}
                aria-expanded={isOpen}
              >
                <span className="text-[20px] font-bold text-content break-keep pr-4">
                  <span className="text-primary mr-2">Q.</span>{item.q}
                </span>
                <span className="text-[24px] text-contentLight transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </button>
              
              {isOpen && (
                <div className="px-[24px] pb-[24px] pt-0">
                  <div className="h-[1px] bg-border mb-[16px]"></div>
                  <p className="m-0 text-[18px] leading-[1.7] text-contentMid break-keep">
                    <span className="text-secondary font-bold mr-2">A.</span>{item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
