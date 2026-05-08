/**
 * 판단력 훈련(상황 선택 퀴즈) 도메인 hook
 */
import { useState, useMemo } from "react";
import { SCENARIOS } from "./scenarios";

export const useCognitiveTraining = () => {
    // 1. 전체 시나리오 중 랜덤으로 2개만 뽑아서 고정 (useMemo 사용)
    const randomScenarios = useMemo(() => {
        return [...SCENARIOS]
            .sort(() => Math.random() - 0.5) // 무작위 섞기
            .slice(0, 2)// 앞에서 2개만 선택
            .map(scenario => ({
            ...scenario,
            options: [...scenario.options].sort(() => Math.random() - 0.5) // 선택지 셔플
          }));
    }, []);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    // 선택지 클릭했을 때 핸들러
    const handleSelect = (idx: number) => {
        if (selectedIdx !== null) return;
        setSelectedIdx(idx);
    };

    const nextScenario = () => {
        if (currentIdx < randomScenarios.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setSelectedIdx(null);
        }
    };

    return {
        scenario: randomScenarios[currentIdx],
        selectedIdx,
        handleSelect,
        nextScenario,
        isLast: currentIdx === randomScenarios.length - 1,
        totalQuestions: randomScenarios.length - 1
    };
};