/**
 * 마이페이지 도메인 Hook
 */
import { useEffect, useState } from 'react'
import { mypageApi } from './api'
import type { MypageSummaryResponse, MypageTabKey, MypageTabSection } from './types'

const fallbackSummary: MypageSummaryResponse = {
  user: {
    id: 'local-user',
    name: '강민 이',
    email: 'jvmmf310@gmail.com',
    joinedLabel: '가입 1분 미만 후',
  },
  survey: {
    needsUpdate: true,
    bannerTitle: '생활습관 설문을 작성해주세요',
    bannerDescription: '설문을 통해 현재 상태를 파악하고 맞춤형 루틴 추천을 받아보세요.',
  },
  summary: {
    streakDays: 5,
    todayRoutineCompleted: 2,
    todayRoutineTotal: 3,
    weeklyAchievementRate: 68,
    trainingCompletedCount: 4,
  },
  recentActivities: [
    {
      title: '아침 산책 루틴 완료',
      detail: '오늘 오전 8:10',
      type: 'routine',
    },
    {
      title: '기억력 카드 게임 플레이',
      detail: '어제 오후 7:30',
      type: 'training',
    },
    {
      title: '수면 습관 설문 저장',
      detail: '어제 오후 6:05',
      type: 'survey',
    },
  ],
  tabs: {
    survey: {
      heading: '생활습관 설문 요약',
      description:
        '최근 설문을 기준으로 수면 리듬과 가벼운 운동 습관은 안정적이지만, 대화 빈도와 수분 섭취는 조금 더 챙기면 좋습니다.',
      bullets: ['수면 규칙성 양호', '하루 물 섭취량 보완 필요', '주 4회 이상 산책 유지 중'],
    },
    routine: {
      heading: '이번 주 루틴 진행 현황',
      description:
        '이번 주에는 총 9개의 루틴 중 6개를 완료했습니다. 저녁 스트레칭과 취침 전 화면 줄이기 루틴이 가장 잘 유지되고 있습니다.',
      bullets: ['저녁 스트레칭 3회 완료', '식후 산책 2회 완료', '취침 전 화면 줄이기 1회 완료'],
    },
    training: {
      heading: '인지훈련 요약',
      description:
        '최근에는 기억력 카드와 순서 맞추기 게임을 중심으로 진행하고 있습니다. 평균 반응 속도는 지난주보다 조금 더 좋아졌습니다.',
      bullets: ['기억력 카드 3회 플레이', '순서 맞추기 1회 플레이', '평균 정확도 82%'],
    },
  },
}

function normalizeTabSection(
  payload: Partial<MypageTabSection> | undefined,
  fallback: MypageTabSection,
): MypageTabSection {
  return {
    heading: payload?.heading ?? fallback.heading,
    description: payload?.description ?? fallback.description,
    bullets: payload?.bullets?.length ? payload.bullets : fallback.bullets,
  }
}

function normalizeSummary(payload: Partial<MypageSummaryResponse>): MypageSummaryResponse {
  return {
    user: {
      ...fallbackSummary.user,
      ...payload.user,
    },
    survey: {
      ...fallbackSummary.survey,
      ...payload.survey,
    },
    summary: {
      ...fallbackSummary.summary,
      ...payload.summary,
    },
    recentActivities: payload.recentActivities?.length ? payload.recentActivities : fallbackSummary.recentActivities,
    tabs: (['survey', 'routine', 'training'] as MypageTabKey[]).reduce(
      (accumulator, currentKey) => {
        accumulator[currentKey] = normalizeTabSection(
          payload.tabs?.[currentKey],
          fallbackSummary.tabs[currentKey],
        )
        return accumulator
      },
      {} as Record<MypageTabKey, MypageTabSection>,
    ),
  }
}

export const useMypage = () => {
  const [summary, setSummary] = useState<MypageSummaryResponse>(fallbackSummary)
  const [isLoading, setIsLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadSummary() {
      try {
        const response = await mypageApi.getSummary()

        if (!isMounted) {
          return
        }

        setSummary(normalizeSummary(response))
        setIsFallback(false)
        setError(null)
      } catch (loadError) {
        console.error('mypage summary fetch failed', loadError)

        if (!isMounted) {
          return
        }

        setSummary(fallbackSummary)
        setIsFallback(true)
        setError('마이페이지 API가 아직 연결되지 않아 예시 데이터를 보여드리고 있어요.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSummary()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    error,
    isFallback,
    isLoading,
    summary,
  }
}
