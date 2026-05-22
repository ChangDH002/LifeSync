import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks';
import { surveyApi } from '../api';
import { useSurvey } from '../hooks';
import { DementiaSurveySubmitResponse, SurveyOption, SurveyQuestion, SurveyResponse } from '../types';
import { X } from 'lucide-react';

function choice(label: string, value: string, score: number): SurveyOption {
  return { label, value, score };
}

function parseSurveyAnswerValue(questionId: string, answer: string): string | number | boolean {
  const booleanQuestionIds = new Set([
    'high_cholesterol',
    'has_diabetes',
    'has_stroke',
    'has_hypertension',
    'has_atrial_fib',
    'depression',
    'has_tbi',
    'insomnia',
    'pesticide_exposure',
  ]);

  if (booleanQuestionIds.has(questionId)) {
    return answer === 'true';
  }

  if (questionId === 'age') {
    const ageMap: Record<string, number> = {
      under_45: 44,
      '45_54': 50,
      '55_64': 60,
      '65_74': 70,
      '75_plus': 80,
    }
    return ageMap[answer] ?? answer
  }

  return answer;
}

function buildSurveyResponseMap(responses: SurveyResponse[]) {
  return responses.reduce<Record<string, string | number | boolean>>((acc, response) => {
    acc[response.questionId] = parseSurveyAnswerValue(response.questionId, response.answer);
    return acc;
  }, {});
}

const FACTOR_CATEGORY_MAP: Record<string, '인구통계' | '심혈관·대사' | '심리·신경' | '생활습관'> = {
  age: '인구통계',
  education_level: '인구통계',
  bmi: '심혈관·대사',
  high_cholesterol: '심혈관·대사',
  has_diabetes: '심혈관·대사',
  has_stroke: '심혈관·대사',
  has_hypertension: '심혈관·대사',
  has_atrial_fib: '심혈관·대사',
  depression: '심리·신경',
  has_tbi: '심리·신경',
  loneliness: '심리·신경',
  social_engagement: '심리·신경',
  insomnia: '심리·신경',
  cognitive_activity: '생활습관',
  physical_activity: '생활습관',
  fish_intake: '생활습관',
  smoking_status: '생활습관',
  pesticide_exposure: '생활습관',
  alcohol_intake: '생활습관',
}

function buildServerCategoryScores(serverResult: DementiaSurveySubmitResponse | null) {
  if (!serverResult?.cogdrisk || !serverResult?.anuAdri) {
    return null;
  }

  const summedFactors: Record<string, number> = {};

  for (const [factor, score] of Object.entries(serverResult.cogdrisk.matchedFactors)) {
    summedFactors[factor] = (summedFactors[factor] || 0) + score;
  }

  for (const [factor, score] of Object.entries(serverResult.anuAdri.matchedFactors)) {
    summedFactors[factor] = (summedFactors[factor] || 0) + score;
  }

  const categoryScores: Record<string, number> = {
    '인구통계': 0,
    '심혈관·대사': 0,
    '심리·신경': 0,
    '생활습관': 0,
  }

  for (const [factor, score] of Object.entries(summedFactors)) {
    const category = FACTOR_CATEGORY_MAP[factor]
    if (category) {
      categoryScores[category] += score
    }
  }

  return Object.fromEntries(
    Object.entries(categoryScores).map(([category, score]) => [category, Number(score.toFixed(1))]),
  )
}

const SURVEY_DATA: SurveyQuestion[] = [
  {
    id: 'age',
    text: '현재 연령대를 선택해주세요.',
    description: '두 모델 모두 연령이 가장 큰 위험도 결정 요인입니다.',
    category: '인구통계',
    options: [
      choice('44세 이하', 'under_45', 0),
      choice('45세~54세', '45_54', 4),
      choice('55세~64세', '55_64', 8),
      choice('65세~74세', '65_74', 14),
      choice('75세 이상', '75_plus', 20),
    ],
  },
  {
    id: 'sex',
    text: '성별을 선택해주세요.',
    description: '두 평가 도구 모두 연령과 함께 성별 구간을 반영합니다.',
    category: '인구통계',
    options: [choice('남성', 'male', 0), choice('여성', 'female', 0)],
  },
  {
    id: 'education_level',
    text: '최종 학력 수준을 선택해주세요.',
    description: '교육 수준은 두 모델 모두에서 반복적으로 반영되는 핵심 보호·위험 인자입니다.',
    category: '인구통계',
    options: [
      choice('대학 이상', 'high', 0),
      choice('고등학교', 'medium', 2),
      choice('중학교 이하', 'low', 4),
    ],
  },
  {
    id: 'high_cholesterol',
    text: '고지혈증 또는 높은 콜레스테롤 수치를 진단받은 적이 있나요?',
    category: '심혈관·대사',
    options: [choice('예', 'true', 3), choice('아니오', 'false', 0)],
  },
  {
    id: 'has_diabetes',
    text: '의사에게 당뇨병을 진단받은 적이 있나요?',
    category: '심혈관·대사',
    options: [choice('예', 'true', 3), choice('아니오', 'false', 0)],
  },
  {
    id: 'has_stroke',
    text: '뇌졸중(중풍) 병력이 있나요?',
    category: '심혈관·대사',
    options: [choice('예', 'true', 2), choice('아니오', 'false', 0)],
  },
  {
    id: 'has_hypertension',
    text: '고혈압 진단을 받았거나 혈압약을 복용 중인가요?',
    category: '심혈관·대사',
    options: [choice('예', 'true', 1), choice('아니오', 'false', 0)],
  },
  {
    id: 'has_atrial_fib',
    text: '심방세동 진단을 받았거나 불규칙한 맥박으로 치료받은 적이 있나요?',
    description: 'CogDrisk에서 반영되는 심혈관 고위험 항목입니다.',
    category: '심혈관·대사',
    options: [choice('예', 'true', 2), choice('아니오', 'false', 0)],
  },
  {
    id: 'depression',
    text: '최근 6개월 이상 우울감, 무기력감, 흥미 저하가 지속되었나요?',
    description: 'CogDrisk와 ANU-ADRI 모두 우울/활동 저하를 주요 위험 인자로 봅니다.',
    category: '심리·신경',
    options: [choice('예', 'true', 3), choice('아니오', 'false', 0)],
  },
  {
    id: 'has_tbi',
    text: '의식 저하나 입원이 필요했던 머리 외상(TBI) 경험이 있나요?',
    category: '심리·신경',
    options: [choice('예', 'true', 2), choice('아니오', 'false', 0)],
  },
  {
    id: 'social_engagement',
    text: '가족, 친구, 모임 등과의 사회적 교류 빈도는 어느 정도인가요?',
    description: '고립감과 사회활동 보호 인자를 함께 보기 위한 공통 질문입니다.',
    category: '심리·신경',
    options: [
      choice('교류가 적고 대부분 혼자 지낸다', 'low', 2),
      choice('보통 수준이다', 'medium', 0),
      choice('자주 만나거나 활발히 교류한다', 'high', -2),
    ],
  },
  {
    id: 'insomnia',
    text: '잠들기 어렵거나 자주 깨는 불면 증상이 반복되나요?',
    description: 'CogDrisk에서 반영되는 수면 관련 고위험 항목입니다.',
    category: '심리·신경',
    options: [choice('예', 'true', 2), choice('아니오', 'false', 0)],
  },
  {
    id: 'physical_activity',
    text: '주당 신체 활동량은 어느 정도인가요?',
    description: 'CogDrisk와 ANU-ADRI 모두 신체활동 부족을 중요한 위험 인자로 봅니다.',
    category: '생활습관',
    options: [
      choice('주 150분 이상 또는 거의 매일 활동한다', 'high', -3),
      choice('가끔 하지만 권장량에는 조금 부족하다', 'medium', -1),
      choice('거의 하지 않는다', 'low', 3),
    ],
  },
  {
    id: 'cognitive_activity',
    text: '독서, 퍼즐, 학습, 계산 같은 인지 활동을 얼마나 자주 하나요?',
    description: '인지 활동은 두 모델 모두에서 대표적인 보호 인자입니다.',
    category: '생활습관',
    options: [
      choice('자주 한다', 'high', -4),
      choice('보통이다', 'medium', -2),
      choice('거의 하지 않는다', 'low', 3),
    ],
  },
  {
    id: 'fish_intake',
    text: '생선 섭취 빈도는 어느 정도인가요?',
    description: '특히 ANU-ADRI에서는 섭취 빈도에 따라 보호 점수가 세분화됩니다.',
    category: '생활습관',
    options: [
      choice('거의 먹지 않는다', 'none', 1),
      choice('주 1회 정도 먹는다', 'weekly', -1),
      choice('주 2~6회 먹는다', 'frequent', -2),
      choice('거의 매일 먹는다', 'daily', -3),
    ],
  },
  {
    id: 'alcohol_intake',
    text: '음주 습관을 가장 잘 설명하는 항목을 선택해주세요.',
    description: 'ANU-ADRI에서는 가벼운 음주가 보호 인자로 반영됩니다.',
    category: '생활습관',
    options: [
      choice('마시지 않는다', 'none', 0),
      choice('가끔 또는 적당히 마신다', 'light_to_moderate', -3),
      choice('자주 많이 마신다', 'high', 1),
    ],
  },
  {
    id: 'smoking_status',
    text: '흡연 상태를 선택해주세요.',
    category: '생활습관',
    options: [
      choice('현재 흡연 중', 'current', 1),
      choice('과거 흡연했지만 금연함', 'former', 0),
      choice('흡연한 적 없음', 'never', 0),
    ],
  },
  {
    id: 'pesticide_exposure',
    text: '농약이나 살충제에 장기간 반복적으로 노출된 적이 있나요?',
    description: 'ANU-ADRI에서 추가로 반영되는 고위험 항목입니다.',
    category: '생활습관',
    options: [choice('예', 'true', 2), choice('아니오', 'false', 0)],
  },
];

export function DementiaSurvey() {
  const navigate = useNavigate();

  const { 
    currentQuestion, 
    progress, 
    isFinished, 
    responses,
    yesCount, 
    categoryScores,
    handleAnswer,
    currentIndex 
  } = useSurvey(SURVEY_DATA);

  if (isFinished) {
    return (
      <SurveyResultView
        yesCount={yesCount}
        categoryScores={categoryScores}
        responses={responses}
      />
    );
  }

  return (
    <div className="flex flex-col items-center pt-12 pb-12 w-full bg-background">
      <div className="w-full max-w-[640px] mx-auto bg-surface rounded-[40px] p-10 shadow-md border-2 border-primaryPale">{/**/}
        <div className="w-full h-4 bg-border rounded-full mb-12 overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="text-center mb-14">
          <span className="inline-block px-5 py-1.5 bg-primary text-white text-[20px] font-bold rounded-full mb-6 shadow-sm">
            질문 {currentIndex + 1} / {SURVEY_DATA.length}
          </span>
          <h2 className="text-[24px] md:text-[30px] font-bold text-tealDark break-keep leading-snug">
            {currentQuestion.text}
          </h2>
          {currentQuestion.description ? (
            <p className="mt-4 text-[18px] leading-8 text-contentMid">{currentQuestion.description}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          {currentQuestion.options.map((option) => (
            <button 
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`w-full py-7 text-[24px] font-bold rounded-[25px] transition-all shadow-sm ${
                option.score > 0
                  ? "bg-primary text-surface hover:bg-primary/80 shadow-md" //[#b86d30]
                  : "bg-surface border-2 border-border text-contentMid hover:bg-gray-100"//backgroundMin
              }`}
            >
              {option.label}
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
function SurveyResultView({
  yesCount,
  categoryScores,
  responses,
}: {
  yesCount: number;
  categoryScores: Record<string, number>;
  responses: SurveyResponse[];
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const hasSavedRef = useRef(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error' | 'unauthenticated'>('idle');
  const [serverResult, setServerResult] = useState<DementiaSurveySubmitResponse | null>(null);

  const getResult = (finalScore?: number, riskLevel?: string) => {
    if (riskLevel === '위험도 낮음' || (finalScore !== undefined && finalScore < 33)) {
      return {
        status: '위험도 낮음',
        color: 'text-primary',
        title: '전반적 위험도는 낮은 편입니다.',
        desc: '현재 응답 기준으로 보호 요인이 비교적 유지되고 있습니다. 지금의 생활습관과 활동 수준을 꾸준히 이어가는 것이 중요합니다.',
        action: '오늘의 루틴 유지하기',
        to: '/',
      };
    }
    if (riskLevel === '위험도 높음' || (finalScore !== undefined && finalScore >= 66)) {
      return {
        status: '위험도 높음',
        color: 'text-red-500',
        title: '고위험 인자 관리가 필요합니다.',
        desc: '백엔드 계산 기준으로 대사질환, 기분 상태, 활동 부족, 연령 관련 요인이 복합적으로 반영됐습니다. 생활습관 개선과 함께 전문 상담을 권장합니다.',
        action: '전문가 상담 안내',
        to: '/medical-notice',
      };
    }
    if (riskLevel === '위험도 보통' || finalScore !== undefined) {
      return {
        status: '위험도 보통',
        color: 'text-secondary',
        title: '핵심 위험 요인 관리가 필요합니다.',
        desc: '백엔드 계산 기준으로 일부 고가중치 위험 인자가 반영됐습니다. 점수가 높게 나온 영역부터 우선 관리해보세요.',
        action: '맞춤 루틴 시작하기',
        to: '/training',
      };
    }
    if (yesCount <= 7) return { 
      status: "위험도 낮음", 
      color: "text-primary", 
      title: "전반적 위험도는 낮은 편입니다.", 
      desc: "고가중치 위험 인자가 많지 않습니다. 현재의 생활습관과 활동 수준을 유지하는 것이 중요합니다.", 
      action: "오늘의 루틴 유지하기", 
      to: "/" 
    };
    if (yesCount <= 17) return { 
      status: "위험도 보통", 
      color: "text-secondary", 
      title: "핵심 위험 요인 관리가 필요합니다.", 
      desc: "연령, 대사질환, 우울·외상 이력, 활동 부족 같은 주요 항목 중 일부가 위험 신호로 나타났습니다. 점수가 높은 영역부터 우선 관리해보세요.", 
      action: "맞춤 루틴 시작하기", 
      to: "/training" 
    };
    return { 
      status: "위험도 높음", 
      color: "text-red-500", 
      title: "고가중치 위험 인자 관리가 시급합니다.", 
      desc: "연령대, 교육 수준, 대사질환, 우울, 외상, 활동 부족 등 주요 위험 인자가 복합적으로 나타났습니다. 생활습관 개선과 함께 전문 상담을 권장합니다.", 
      action: "전문가 상담 안내", 
      to: "/medical-notice" 
    };
  };

  const finalScore = serverResult?.finalRiskScore;
  const result = getResult(finalScore, serverResult?.riskLevel);
  const displayedScore = finalScore ?? yesCount;
  const displayedCategoryScores = buildServerCategoryScores(serverResult) ?? categoryScores;

  useEffect(() => {
    let cancelled = false;

    async function saveSurveyResult() {
      if (hasSavedRef.current) {
        return;
      }
      hasSavedRef.current = true;

      if (!isAuthenticated) {
        setSaveState('unauthenticated');
        return;
      }

      setSaveState('saving');

      try {
        const saved = await surveyApi.saveDementiaRiskResult({
          surveyType: 'dementia-risk',
          totalScore: yesCount,
          riskLevel: result.status,
          categoryScores,
          responses: buildSurveyResponseMap(responses),
        });

        if (!cancelled) {
          setServerResult(saved);
          setSaveState('saved');
        }
      } catch (error) {
        console.error('survey result save failed', error);
        if (!cancelled) {
          setSaveState('error');
        }
      }
    }

    void saveSurveyResult();

    return () => {
      cancelled = true;
    };
  }, [categoryScores, isAuthenticated, responses, result.status, yesCount]);

  const saveStatusMessage = (() => {
    if (saveState === 'saving') {
      return '설문 결과를 저장하고 있습니다.';
    }
    if (saveState === 'saved') {
      return '설문 결과가 백엔드에 저장되었습니다.';
    }
    if (saveState === 'error') {
      return '설문 결과 저장에 실패했습니다. 잠시 후 다시 시도해주세요.';
    }
    if (saveState === 'unauthenticated') {
      return '로그인하면 설문 결과가 마이페이지에 저장됩니다.';
    }
    return '';
  })();

  return (
    <div className="max-w-[600px] mx-auto bg-surface rounded-[30px] p-8 shadow-lg border-2 border-primaryPale text-center animate-fadeIn">
      <div className={`text-[24px] font-bold ${result.color} mb-4`}>
        {result.status} ({displayedScore}{finalScore !== undefined ? '점 / 100점' : '점'})
      </div>
      <h2 className="text-[28px] font-bold text-tealDark mb-4">{result.title}</h2>
      {serverResult?.cogdrisk && serverResult?.anuAdri ? (
        <div className="bg-surface border border-primary/10 rounded-[20px] p-5 mb-6 text-left">
          <div className="flex justify-between items-center text-[18px] text-contentMid mb-2">
            <span>CogDrisk</span>
            <span className="font-bold text-tealDark">{serverResult.cogdrisk.normalizedScore}점</span>
          </div>
          <div className="flex justify-between items-center text-[18px] text-contentMid">
            <span>ANU-ADRI</span>
            <span className="font-bold text-tealDark">{serverResult.anuAdri.normalizedScore}점</span>
          </div>
        </div>
      ) : null}
      <div className="bg-backgroundMin rounded-[20px] p-6 mb-8 text-left border border-primary/10">
        <h3 className="text-[26px] font-bold text-tealDark mb-4 text-center border-b border-primary/10 pb-2">영역별 분석</h3>
        <div className="space-y-3">
          {Object.entries(displayedCategoryScores).map(([category, score]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-[22px] text-contentMid font-medium">{category}</span>
              <span className={`text-[22px] font-bold ${score >= 4 ? 'text-red-500' : score > 0 ? 'text-secondary' : 'text-primary'}`}>
                {score}점 {score >= 4 ? '(우선 관리)' : score > 0 ? '(점검 필요)' : '(양호)'}
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
      {saveStatusMessage ? (
        <p
          className={`mb-8 text-[18px] font-medium ${
            saveState === 'error' ? 'text-red-500' : 'text-contentMid'
          }`}
        >
          {saveStatusMessage}
        </p>
      ) : null}
      
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
