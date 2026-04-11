/**
 * 판단력 훈련(상황 선택 퀴즈) 도메인 hook
 */
import { useState } from "react";

export interface Scenario {
  id: number;
  question: string;
  options: { text: string; isCorrect: boolean; feedback: string }[];
}

const scenarios: Scenario[] = [
    {
        id: 1,
        question: "모르는 번호로 '아들이 다쳤다'며 입금을 요구하는 문자가 왔습니다. 어떻게 하실 건가요?",
        options: [
            { text: "아들에게 직접 전화하여 사실을 확인한다.", isCorrect: true, feedback: "정답입니다! 반드시 직접 확인하는 습관이 중요해요." },
            { text: "급한 상황이니 알려준 계좌로 바로 송금한다.", isCorrect: false, feedback: "위험합니다! 전형적인 보이스피싱 수법이에요." }
        ]
    },
    {
        id: 2,
        question: "날씨가 좋지 않아서 외출을 하기 어렵습니다. 어떻게 하실 건가요?",
        options: [
            { text: "집에서 쉬는 것이 좋습니다.", isCorrect: true, feedback: "좋은 선택입니다! 날씨가 좋지 않을 때는 집에서 휴식을 취하는 것이 중요해요." },
            { text: "비를 맞으며 걷는다.", isCorrect: false, feedback: "비에 젖으면 감기에 걸릴 수 있어요. 우산을 빌리거나 대중교통을 이용하는 것이 좋습니다." }
        ]

    }
];

export const useCognitiveTraining = () => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    // 선택지 클릭했을 때 핸들러
    const handleSelect = (idx: number) => {
        if (selectedIdx !== null) return;
        setSelectedIdx(idx);
    };

    const nextScenario = () => {
        if (currentIdx < scenarios.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setSelectedIdx(null);
        }
    };

    return {
        scenario: scenarios[currentIdx],
        selectedIdx,
        handleSelect,
        nextScenario,
        isLast: currentIdx === scenarios.length - 1
    };
};