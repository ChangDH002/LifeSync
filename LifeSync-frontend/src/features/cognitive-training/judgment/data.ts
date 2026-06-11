export interface JudgmentScenario {
  id: string
  /** 상황 설명 */
  situation: string
  /** 사용자에게 주어지는 질문 */
  question: string
  /** 난이도 (1: 쉬움, 2: 보통, 3: 어려움) */
  difficulty: 1 | 2 | 3
  /** 선택지 목록 */
  options: {
    text: string
    isCorrect: boolean
    /** 정답/오답에 대한 피드백 */
    feedback: string
  }[]
}

/**
 * 상황 판단력 훈련에 사용할 시나리오 목록입니다.
 * 실제 공공 데이터 및 안전 교육 자료를 참고하여 확장되었습니다.
 */
const scenarios: JudgmentScenario[] = [
  // --- 난이도 1: 명확한 정답이 있는 금융/안전 문제 ---
  {
    id: 's1',
    situation: '길을 걷다가 모르는 사람이 다가와 "급한 일이 생겼는데, 돈을 빌려주면 내일 바로 갚겠다"고 말합니다.',
    question: '어떻게 행동하는 것이 가장 안전할까요?',
    difficulty: 1,
    options: [
      { text: '안타까운 마음에 가진 현금을 모두 빌려준다.', isCorrect: false, feedback: '모르는 사람에게 돈을 빌려주는 것은 위험할 수 있습니다.' },
      { text: '정중히 거절하고 자리를 피한다.', isCorrect: true, feedback: '맞습니다. 모르는 사람의 부탁은 신중하게 거절하는 것이 안전합니다.' },
      { text: '근처 은행에 함께 가서 돈을 찾아준다.', isCorrect: false, feedback: '상대방의 의도를 알 수 없으므로, 함께 이동하는 것은 위험합니다.' },
    ],
  },
  {
    id: 's2',
    situation: '전화로 "검찰청인데, 당신의 계좌가 범죄에 연루되었으니 돈을 안전한 곳으로 옮겨야 한다"는 연락을 받았습니다.',
    question: '어떻게 대처해야 할까요?',
    difficulty: 1,
    options: [
      { text: '전화를 끊고 112에 신고하여 사실 여부를 확인한다.', isCorrect: true, feedback: '정답입니다! 공공기관은 절대 전화로 돈을 요구하지 않습니다.' },
      { text: '검찰의 지시에 따라 돈을 이체한다.', isCorrect: false, feedback: '위험합니다! 이것은 전형적인 보이스피싱 수법입니다.' },
      { text: '개인정보와 계좌 비밀번호를 알려준다.', isCorrect: false, feedback: '절대 개인정보나 금융정보를 알려주어서는 안 됩니다.' },
    ],
  },
  {
    id: 's3',
    situation: "모르는 번호로 '아들이 다쳤다'며 입금을 요구하는 문자가 왔습니다.",
    question: '어떻게 하실 건가요?',
    difficulty: 1,
    options: [
      { text: '아들에게 직접 전화하여 사실을 확인한다.', isCorrect: true, feedback: '정답입니다! 반드시 직접 확인하는 습관이 중요해요.' },
      { text: '알려준 계좌로 바로 송금한다.', isCorrect: false, feedback: '위험합니다! 전형적인 보이스피싱 수법이에요.' },
    ],
  },

  // --- 난이도 2: 일상 생활에서의 다단계 판단 문제 ---
  {
    id: 's4',
    situation: '날씨가 좋지 않아서 외출을 하기 어렵습니다. 하지만 꼭 사야 할 약이 있습니다.',
    question: '어떻게 하는 것이 좋을까요?',
    difficulty: 2,
    options: [
      { text: '가족이나 이웃에게 부탁하여 약을 사다 달라고 한다.', isCorrect: true, feedback: '좋은 선택입니다! 무리하게 외출하기보다 주변에 도움을 요청하는 것이 안전해요.' },
      { text: '비를 맞으며 약국에 다녀온다.', isCorrect: false, feedback: '비에 젖으면 감기에 걸릴 수 있어요. 안전이 최우선입니다.' },
      { text: '약을 사지 않고 다음 날까지 기다린다.', isCorrect: false, feedback: '꼭 필요한 약이라면 거르지 않는 것이 중요합니다.' },
    ],
  },
  {
    id: 's5',
    situation: "은행 직원이 '신분증을 복사하고, 서류 두 곳에 서명한 뒤, 3번 창구로 가세요'라고 했습니다.",
    question: '가장 먼저 해야 할 일은 무엇인가요?',
    difficulty: 2,
    options: [
      { text: '가지고 있는 신분증을 직원에게 준다.', isCorrect: true, feedback: '정답입니다! 지시사항이 길 때는 순서대로 첫 단계부터 차근차근 해결해야 합니다.' },
      { text: '3번 창구로 걸어간다.', isCorrect: false, feedback: '앞의 단계를 빼먹으면 업무를 처리할 수 없어요. 순서를 기억하는 연습이 필요합니다.' },
      { text: '서류에 서명부터 한다.', isCorrect: false, feedback: '신분증 복사가 먼저였습니다. 순서를 잘 기억해 보세요.' },
    ],
  },

  // --- 난이도 3: 여러 정보를 종합하여 최적의 판단을 내리는 문제 ---
  {
    id: 's6',
    situation: '이번 달에 꼭 내야 하는 약값 3만 원과 전기요금 2만 원이 있습니다. 그런데 시장에 갔다가 마음에 쏙 드는 3만 원짜리 예쁜 옷을 발견했습니다. 현재 주머니에는 총 7만 원이 있습니다.',
    question: '어떻게 하는 것이 가장 현명할까요?',
    difficulty: 3,
    options: [
      { text: '옷을 사지 않고, 필수 지출부터 해결한다.', isCorrect: true, feedback: '정답입니다! 필수 지출을 먼저 해결하는 것이 현명한 돈 관리법입니다.' },
      { text: '일단 옷을 사고, 남은 돈으로 요금을 낸다.', isCorrect: false, feedback: '옷을 사면 4만 원이 남아 요금(5만 원)을 다 낼 수 없게 됩니다.' },
      { text: '옷과 약값만 계산하고, 전기요금은 다음으로 미룬다.', isCorrect: false, feedback: '전기요금을 미루면 연체료가 발생할 수 있어 좋은 선택이 아닙니다.' },
    ],
  },
  {
    id: 's7',
    situation: "정류장 벽에 100번 버스와 1000번 버스의 노선도가 붙어있습니다. 목적지는 '서울역'입니다.\n[100번] 시청역 → 서울역 → 숙대입구역\n[1000번] 시청역 → 신촌역 → 홍대입구역",
    question: '어떤 버스를 타야 할까요?',
    difficulty: 3,
    options: [
      { text: '100번 버스를 이용한다.', isCorrect: true, feedback: '정답입니다! 두 버스의 노선을 꼼꼼하게 비교하여 목적지가 있는 버스를 잘 찾아내셨습니다.' },
      { text: '1000번 버스를 이용한다.', isCorrect: false, feedback: "다시 한번 노선도를 살펴볼까요? 1000번 버스 노선에는 '서울역'이 없습니다." },
    ],
  },
]

/**
 * 특정 난이도의 시나리오를 무작위로 선택하여 반환합니다.
 */
export function getScenariosByDifficulty(difficulty: number, count: number): JudgmentScenario[] {
  const filtered = scenarios.filter((s) => s.difficulty === difficulty)

  // 요청된 난이도의 시나리오가 충분하지 않으면, 더 낮은 난이도에서 가져옵니다.
  let source = filtered
  if (source.length < count) {
    const lowerDifficultyScenarios = scenarios.filter((s) => s.difficulty < difficulty)
    source = [...source, ...lowerDifficultyScenarios]
  }

  const shuffled = source.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}