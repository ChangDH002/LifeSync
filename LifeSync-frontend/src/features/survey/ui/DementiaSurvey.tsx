import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../hooks';
import { SurveyQuestion } from '../types';
import { Home, X } from 'lucide-react';

const SURVEY_DATA: SurveyQuestion[] = [
  // 수면 영역
  { id: "a1", text: "최근 1주일 동안 하루 평균 수면 시간이 6시간 미만이었나요?", options: ["예", "아니오"], riskAnswer: "예", category: "수면" },
  { id: "a2", text: "잠을 자도 피로가 풀리지 않는 날이 많았나요?", options: ["예", "아니오"], riskAnswer: "예", category: "수면" },
  { id: "a3", text: "잠드는 시간이나 일어나는 시간이 불규칙한 편인가요?", options: ["예", "아니오"], riskAnswer: "예", category: "수면" },
  { id: "a4", text: "밤에 자주 깨거나 깊게 잠들기 어렵다고 느끼나요?", options: ["예", "아니오"], riskAnswer: "예", category: "수면" },
  // 식습관 영역
  { id: "b5", text: "아침 식사를 자주 거르는 편인가요?", options: ["예", "아니오"], riskAnswer: "예", category: "식습관" },
  { id: "b6", text: "채소나 과일을 거의 먹지 않는 편인가요?", options: ["예", "아니오"], riskAnswer: "예", category: "식습관" },
  { id: "b7", text: "인스턴트 음식, 가공식품, 배달음식을 자주 먹나요?", options: ["예", "아니오"], riskAnswer: "예", category: "식습관" },
  { id: "b8", text: "물을 충분히 마시지 않는 편인가요?", options: ["예", "아니오"], riskAnswer: "예", category: "식습관" },
  // 신체활동 영역
  { id: "c9", text: "일주일에 3회 이상 걷기나 가벼운 운동을 하지 않나요?", options: ["예", "아니오"], riskAnswer: "예", category: "신체활동" },
  { id: "c10", text: "하루 대부분의 시간을 앉거나 누워서 보내나요?", options: ["예", "아니오"], riskAnswer: "예", category: "신체활동" },
  { id: "c11", text: "계단 이용, 산책, 집안일 같은 일상 활동이 적은 편인가요?", options: ["예", "아니오"], riskAnswer: "예", category: "신체활동" },
  { id: "c12", text: "최근 한 달 동안 신체활동량이 이전보다 줄었다고 느끼나요?", options: ["예", "아니오"], riskAnswer: "예", category: "신체활동" },
  // 인지활동 영역
  { id: "d13", text: "독서, 글쓰기, 계산, 퍼즐 같은 두뇌 활동을 거의 하지 않나요?", options: ["예", "아니오"], riskAnswer: "예", category: "인지활동" },
  { id: "d14", text: "새로운 것을 배우거나 익히는 활동이 적은 편인가요?", options: ["예", "아니오"], riskAnswer: "예", category: "인지활동" },
  { id: "d15", text: "최근 약속, 물건 위치, 해야 할 일을 자주 잊는다고 느끼나요?", options: ["예", "아니오"], riskAnswer: "예", category: "인지활동" },
  { id: "d16", text: "예전보다 집중력이 떨어졌다고 느끼나요?", options: ["예", "아니오"], riskAnswer: "예", category: "인지활동" },
  { id: "d17", text: "단어가 바로 떠오르지 않거나 말이 막히는 경우가 자주 있나요?", options: ["예", "아니오"], riskAnswer: "예", category: "인지활동" },
  // 정서 및 사회 영역
  { id: "e18", text: "최근 우울감이나 무기력감을 자주 느끼나요?", options: ["예", "아니오"], riskAnswer: "예", category: "정서 및 사회" },
  { id: "e19", text: "스트레스를 자주 받는 편인가요?", options: ["예", "아니오"], riskAnswer: "예", category: "정서 및 사회" },
  { id: "e20", text: "가족, 친구, 지인과 대화하거나 만나는 일이 적은 편인가요?", options: ["예", "아니오"], riskAnswer: "예", category: "정서 및 사회" },
  { id: "e21", text: "혼자 있는 시간이 많고 외로움을 자주 느끼나요?", options: ["예", "아니오"], riskAnswer: "예", category: "정서 및 사회" },
  { id: "e22", text: "새로운 활동이나 외출을 피하는 편인가요?", options: ["예", "아니오"], riskAnswer: "예", category: "정서 및 사회" },
  // 생활관리 영역
  { id: "f23", text: "건강검진이나 병원 방문을 미루는 편인가요?", options: ["예", "아니오"], riskAnswer: "예", category: "생활관리" },
  { id: "f24", text: "혈압, 혈당, 체중 같은 건강 상태를 거의 확인하지 않나요?", options: ["예", "아니오"], riskAnswer: "예", category: "생활관리" },
];

export function DementiaSurvey() {
  const navigate = useNavigate();

  const { 
    currentQuestion, 
    progress, 
    isFinished, 
    yesCount, 
    categoryScores,
    handleAnswer,
    currentIndex 
  } = useSurvey(SURVEY_DATA);

  if (isFinished) {
    return <SurveyResultView yesCount={yesCount} categoryScores={categoryScores} />;
  }

  return (
    <div className="flex flex-col items-center pt-12 pb-12 w-full bg-background">
      <div className="w-full max-w-[640px] mx-auto bg-surface rounded-[40px] p-10 shadow-md border-2 border-primaryPale">{/**/}
        <div className="w-full h-4 bg-border rounded-full mb-12 overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="text-center mb-14">
          <span className="inline-block px-5 py-1.5 bg-primary text-white text-[20px] font-bold rounded-full mb-6 shadow-sm">
            질문 {currentIndex + 1} / 24
          </span>
          <h2 className="text-[24px] md:text-[30px] font-bold text-tealDark break-keep leading-snug">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          {currentQuestion.options.map((option) => (
            <button 
              key={option}
              onClick={() => handleAnswer(option)}
              className={`w-full py-7 text-[24px] font-bold rounded-[25px] transition-all shadow-sm ${
                option === "예" 
                  ? "bg-primary text-surface hover:bg-primary/80 shadow-md" //[#b86d30]
                  : "bg-surface border-2 border-border text-contentMid hover:bg-gray-100"//backgroundMin
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-6 mb-5">
        <button 
            onClick={() => {
              if (window.confirm("설문을 중단하고 홈으로 이동할까요? 기록은 저장되지 않습니다.")) {
                navigate('/');
              }
            }}
            className="flex items-center gap-3 px-10 py-5 text-contentLight hover:text-red-500 hover:bg-red-50 rounded-full transition-all font-medium"
          >
            <X className="w-5 h-5 strokeWidth={2.5}" />
            <span className="text-[22px] font-bold">설문 중단하고 홈으로 이동</span>
          </button>
        </div>
    </div>
  );
}

//설문 결과 뷰 컴포넌트
function SurveyResultView({ yesCount, categoryScores }: { yesCount: number; categoryScores: Record<string, number> }) {
  const navigate = useNavigate();

  const getResult = () => {
    // 위험도 산출 기준 (낮음:0-6, 보통:7-14, 높음:15-24)
    if (yesCount <= 6) return { 
      status: "위험도 낮음", 
      color: "text-primary", 
      title: "비교적 건강한 생활습관입니다!", 
      desc: "위험 요인이 적은 편입니다. 지금처럼 규칙적인 활동을 지속해 보세요.", 
      action: "오늘의 루틴 유지하기", 
      to: "/" 
    };
    if (yesCount <= 14) return { 
      status: "위험도 보통", 
      color: "text-secondary", 
      title: "생활습관 개선이 필요합니다.", 
      desc: "확인된 위험 요인이 있습니다. 점수가 높게 나타난 영역부터 조금씩 바꿔보세요.", 
      action: "맞춤 루틴 시작하기", 
      to: "/training" 
    };
    return { 
      status: "위험도 높음", 
      color: "text-red-500", 
      title: "세심한 관리가 시급합니다.", 
      desc: "여러 위험 요인이 누적되어 있습니다. 전문기관 상담이나 정밀 관리를 권장합니다.", 
      action: "전문가 상담 안내", 
      to: "/medical-notice" 
    };
  };

  const result = getResult();

  return (
    <div className="max-w-[600px] mx-auto bg-surface rounded-[30px] p-8 shadow-lg border-2 border-primaryPale text-center animate-fadeIn">
      <div className={`text-[24px] font-bold ${result.color} mb-4`}>{result.status} ({yesCount}점)</div>
      <h2 className="text-[28px] font-bold text-tealDark mb-4">{result.title}</h2>
      <div className="bg-backgroundMin rounded-[20px] p-6 mb-8 text-left border border-primary/10">
        <h3 className="text-[26px] font-bold text-tealDark mb-4 text-center border-b border-primary/10 pb-2">영역별 분석</h3>
        <div className="space-y-3">
          {Object.entries(categoryScores).map(([category, score]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-[22px] text-contentMid font-medium">{category}</span>
              <span className={`text-[22px] font-bold ${score > 2 ? 'text-red-500' : 'text-primary'}`}>
                {score}점 {score > 2 ? '(주의)' : '(양호)'}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[22px] text-contentMid leading-[1.8] mb-10 whitespace-pre-line text-center">
        {result.desc}
        {"\n\n"}
        <span className="text-[18px] text-contentLight opacity-80">※ 본 결과는 의료 진단이 아닌 생활습관 분석용입니다.</span>
      </p>
      
      <div className="flex flex-col gap-5 mt-4">
        <button 
          onClick={() => navigate(result.to)}
          className="w-full py-6 bg-primary text-surface text-[22px] font-bold rounded-[20px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {result.action}
        </button>

        <button 
          onClick={() => navigate('/')}
          className="w-full py-6 bg-backgroundMin text-tealDark text-[22px] font-bold rounded-[20px] border-2 border-primary/10 hover:bg-primary/5 transition-colors">

          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}