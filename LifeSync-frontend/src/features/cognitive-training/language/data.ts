export interface LanguageGameQuestion {
  id: string
  /** 정답 단어 */
  word: string
  /** 섞인 글자 배열 */
  shuffled: string[]
  /** 힌트로 보여줄 카테고리 */
  category: string
}

/** 단어와 카테고리만 있는 단순한 데이터 구조 */
interface WordBankEntry {
  word: string
  category: string
  /** 난이도 (1: 쉬움, 2: 보통, 3: 어려움) */
  difficulty: 1 | 2 | 3
}

/**
 * 외부에서 가져온 단어 목록.
 * 이제 'word'와 'category'만 추가하면 됩니다.
 */
const wordBank: WordBankEntry[] = [
  // --- 난이도 1: 2~3글자 단어 ---
  { word: '의자', category: '가구', difficulty: 1 },
  { word: '책상', category: '가구', difficulty: 1 },
  { word: '침대', category: '가구', difficulty: 1 },
  { word: '사과', category: '과일', difficulty: 1 },
  { word: '포도', category: '과일', difficulty: 1 },
  { word: '딸기', category: '과일', difficulty: 1 },
  { word: '연필', category: '학용품', difficulty: 1 },
  { word: '가위', category: '학용품', difficulty: 1 },
  { word: '강아지', category: '동물', difficulty: 1 },
  { word: '고양이', category: '동물', difficulty: 1 },
  { word: '기차', category: '탈것', difficulty: 1 },
  { word: '버스', category: '탈것', difficulty: 1 },
  { word: '김치', category: '음식', difficulty: 1 },
  { word: '라면', category: '음식', difficulty: 1 },
  { word: '시계', category: '사물', difficulty: 1 },
  { word: '안경', category: '소지품', difficulty: 1 },
  { word: '축구', category: '운동', difficulty: 1 },
  { word: '야구', category: '운동', difficulty: 1 },
  { word: '한국', category: '나라', difficulty: 1 },
  { word: '봄', category: '계절', difficulty: 1 },
  { word: '여름', category: '계절', difficulty: 1 },
  { word: '가을', category: '계절', difficulty: 1 },
  { word: '겨울', category: '계절', difficulty: 1 },
  { word: '하늘', category: '자연', difficulty: 1 },
  { word: '바다', category: '자연', difficulty: 1 },

  // --- 난이도 2: 4~5글자 단어 ---
  { word: '소파', category: '가구', difficulty: 2 },
  { word: '옷장', category: '가구', difficulty: 2 },
  { word: '바나나', category: '과일', difficulty: 2 },
  { word: '수박', category: '과일', difficulty: 2 },
  { word: '오렌지', category: '과일', difficulty: 2 },
  { word: '지우개', category: '학용품', difficulty: 2 },
  { word: '공책', category: '학용품', difficulty: 2 },
  { word: '호랑이', category: '동물', difficulty: 2 },
  { word: '코끼리', category: '동물', difficulty: 2 },
  { word: '기린', category: '동물', difficulty: 2 },
  { word: '사자', category: '동물', difficulty: 2 },
  { word: '컴퓨터', category: '가전제품', difficulty: 2 },
  { word: '냉장고', category: '가전제품', difficulty: 2 },
  { word: '세탁기', category: '가전제품', difficulty: 2 },
  { word: '에어컨', category: '가전제품', difficulty: 2 },
  { word: '자전거', category: '탈것', difficulty: 2 },
  { word: '비행기', category: '탈것', difficulty: 2 },
  { word: '지하철', category: '탈것', difficulty: 2 },
  { word: '자동차', category: '탈것', difficulty: 2 },
  { word: '불고기', category: '음식', difficulty: 2 },
  { word: '도서관', category: '장소', difficulty: 2 },
  { word: '병원', category: '장소', difficulty: 2 },
  { word: '은행', category: '장소', difficulty: 2 },
  { word: '가족', category: '관계', difficulty: 2 },
  { word: '친구', category: '관계', difficulty: 2 },

  // --- 난이도 3: 6글자 이상 또는 추상적 단어 ---
  { word: '텔레비전', category: '가전제품', difficulty: 3 },
  { word: '비빔밥', category: '음식', difficulty: 3 },
  { word: '대한민국', category: '나라', difficulty: 3 },
  { word: '무궁화', category: '식물', difficulty: 3 },
  { word: '세종대왕', category: '인물', difficulty: 3 },
  { word: '소나기', category: '날씨', difficulty: 3 },
  { word: '약속', category: '추상', difficulty: 3 },
  { word: '행복', category: '추상', difficulty: 3 },
  { word: '건강', category: '추상', difficulty: 3 },
  { word: '사랑', category: '추상', difficulty: 3 },
  { word: '추억', category: '추상', difficulty: 3 },
  { word: '선생님', category: '직업', difficulty: 3 },
  { word: '대통령', category: '직업', difficulty: 3 },
  { word: '소방관', category: '직업', difficulty: 3 },
  { word: '경찰관', category: '직업', difficulty: 3 },
  { word: '아파트', category: '건물', difficulty: 3 },
  { word: '초등학교', category: '건물', difficulty: 3 },
  { word: '우체국', category: '건물', difficulty: 3 },
  { word: '박물관', category: '건물', difficulty: 3 },
  { word: '미술관', category: '건물', difficulty: 3 },
]

/**
 * 특정 난이도의 문제 목록에서 무작위로 여러 개를 선택하여 반환합니다.
 * @param difficulty - 가져올 문제의 난이도 (1, 2, 3)
 * @param count - 가져올 문제의 개수
 */
export function getQuestionsForLevel(difficulty: number, count: number): LanguageGameQuestion[] {
  const filteredByDifficulty = wordBank.filter((entry) => entry.difficulty === difficulty)

  // 요청된 난이도의 단어가 충분하지 않으면, 더 낮은 난이도의 단어를 포함하여 채웁니다.
  let source = filteredByDifficulty
  if (source.length < count) {
    const lowerDifficultyWords = wordBank.filter((entry) => entry.difficulty < difficulty)
    source = [...source, ...lowerDifficultyWords]
  }

  const shuffled = source.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, count)

  return selected.map((entry) => ({
    id: `word_${entry.word}`,
    word: entry.word,
    category: entry.category,
    // 항상 정답과 다른 순서로 섞이도록 보장
    shuffled: entry.word.split('').sort(() => Math.random() - 0.5),
  }))
}
