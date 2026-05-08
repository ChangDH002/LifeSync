import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Brain,
  CalendarCheck2,
  ChevronDown,
  ClipboardList,
  Flame,
  Gamepad2,
  LogOut,
  MessageCircle,
  PencilLine,
  Sparkles,
  UserCircle2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { Button, SectionCard } from '@/shared/ui'
import { useMypage } from '../hooks'
import type { MypageActivityType } from '../types'

const summaryCardDefinitions = [
  {
    title: '연속 달성',
    icon: Flame,
    iconColor: 'text-secondary',
  },
  {
    title: '오늘 루틴',
    icon: CalendarCheck2,
    iconColor: 'text-primary',
  },
  {
    title: '주간 달성률',
    icon: Activity,
    iconColor: 'text-blue-500',
  },
  {
    title: '인지훈련',
    icon: Brain,
    iconColor: 'text-violet-500',
  },
] as const

const quickActions = [
  {
    title: 'AI 챗봇 상담',
    subtitle: '무엇이든 물어보세요',
    to: '/chatbot',
    icon: MessageCircle,
    surfaceClassName: 'bg-primaryPale/80',
    iconWrapClassName: 'bg-primary/15',
    iconClassName: 'text-teal',
  },
  {
    title: '인지훈련 게임',
    subtitle: '뇌를 자극하세요',
    to: '/training',
    icon: Gamepad2,
    surfaceClassName: 'bg-violet-50',
    iconWrapClassName: 'bg-violet-100',
    iconClassName: 'text-violet-500',
  },
] as const

const tabItems = [
  {
    id: 'survey',
    label: '설문 결과',
    icon: ClipboardList,
  },
  {
    id: 'routine',
    label: '루틴 기록',
    icon: CalendarCheck2,
  },
  {
    id: 'training',
    label: '인지훈련',
    icon: Brain,
  },
] as const

type TabId = (typeof tabItems)[number]['id']

function getRecentActivityTone(activityType: MypageActivityType) {
  if (activityType === 'routine') {
    return 'bg-primaryPale text-tealDark'
  }

  if (activityType === 'training') {
    return 'bg-violet-50 text-violet-700'
  }

  if (activityType === 'survey') {
    return 'bg-surface text-contentMid'
  }

  return 'bg-surface text-contentMid'
}

export function MypageSummary() {
  const [activeTab, setActiveTab] = useState<TabId>('survey')
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { summary: mypageSummary, isLoading, isFallback, error } = useMypage()

  const activeTabConfig = tabItems.find((item) => item.id === activeTab) ?? tabItems[0]
  const activeTabContent = mypageSummary.tabs[activeTab]
  const completedRoutines = mypageSummary.summary.todayRoutineCompleted
  const totalRoutines = mypageSummary.summary.todayRoutineTotal
  const routineProgressWidth = `${(completedRoutines / Math.max(totalRoutines, 1)) * 100}%`
  const summaryCards = [
    {
      ...summaryCardDefinitions[0],
      value: String(mypageSummary.summary.streakDays),
      caption: '일 연속',
    },
    {
      ...summaryCardDefinitions[1],
      value: `${mypageSummary.summary.todayRoutineCompleted}/${mypageSummary.summary.todayRoutineTotal}`,
      caption: '완료',
    },
    {
      ...summaryCardDefinitions[2],
      value: `${mypageSummary.summary.weeklyAchievementRate}%`,
      caption: '이번 주',
    },
    {
      ...summaryCardDefinitions[3],
      value: String(mypageSummary.summary.trainingCompletedCount),
      caption: '게임 완료',
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-tealDark md:text-5xl">
          마이페이지
        </h1>
        <p className="mt-4 text-xl leading-9 text-contentMid">
          대시보드와 개인 활동 기록을 이곳에서 함께 확인할 수 있습니다.
        </p>
        {isLoading ? <p className="mt-3 text-base text-contentLight">마이페이지 데이터를 불러오는 중입니다.</p> : null}
        {!isLoading && (isFallback || error) ? (
          <p className="mt-3 text-base text-contentLight">{error}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        <SectionCard className="border-primary/20 bg-primaryPale/50 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-primary shadow-card">
                <Sparkles className="h-8 w-8" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-tealDark">
                  안녕하세요, {mypageSummary.user.name}님!
                </h2>
                <p className="mt-2 text-lg leading-8 text-contentMid">
                  오늘도 건강한 하루를 시작해볼까요?
                </p>
              </div>
            </div>
            {mypageSummary.survey.needsUpdate ? (
              <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-card">
                <ClipboardList className="h-4 w-4" strokeWidth={2.2} />
                설문 업데이트 필요
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-[24px] border border-primary/20 bg-surface/60 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primaryPale text-primary">
                  <Activity className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-[-0.02em] text-tealDark">
                    {mypageSummary.survey.bannerTitle}
                  </h3>
                  <p className="mt-1 text-lg leading-8 text-contentMid">
                    {mypageSummary.survey.bannerDescription}
                  </p>
                </div>
              </div>
              <Button asLink className="px-7" to="/survey">
                지금 설문하기
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primaryPale text-primary shadow-card">
                <UserCircle2 className="h-14 w-14" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-tealDark">
                  {mypageSummary.user.name}
                </h2>
                <p className="mt-1 text-xl text-contentMid">{mypageSummary.user.email}</p>
                <p className="mt-1 text-lg text-contentLight">{mypageSummary.user.joinedLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asLink className="px-6" to="/settings" variant="secondary">
                <span className="flex items-center gap-2">
                  <PencilLine className="h-5 w-5" strokeWidth={2.2} />
                  편집
                </span>
              </Button>
              <Button className="px-6" onClick={handleLogout} variant="secondary">
                <span className="flex items-center gap-2 text-danger">
                  <LogOut className="h-5 w-5" strokeWidth={2.2} />
                  로그아웃
                </span>
              </Button>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => (
            <SectionCard key={item.title} className="p-6">
              <div className="flex items-center gap-2 text-lg text-contentLight">
                <item.icon className={`h-5 w-5 ${item.iconColor}`} strokeWidth={2.2} />
                <span>{item.title}</span>
              </div>
              <p className="mt-4 text-5xl font-extrabold tracking-[-0.04em] text-tealDark">
                {item.value}
              </p>
              <p className="mt-2 text-lg text-contentLight">{item.caption}</p>
            </SectionCard>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <SectionCard className="p-8">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-tealDark">
              오늘의 루틴 진행률
            </h2>
            <div className="mt-7 h-4 rounded-full bg-primaryPale">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-teal"
                style={{ width: routineProgressWidth }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-lg text-contentMid">
              <span>{completedRoutines}개 완료</span>
              <span>총 {totalRoutines}개</span>
            </div>
            <Button
              asLink
              className="mt-7 w-full justify-center rounded-full px-6"
              to="/routine"
              variant="secondary"
            >
              <span className="flex items-center gap-2">
                루틴 관리하기
                <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
              </span>
            </Button>
          </SectionCard>

          <div className="flex flex-col gap-5">
            {quickActions.map((item) => (
              <SectionCard key={item.title} className={`p-6 ${item.surfaceClassName}`}>
                <Button
                  asLink
                  className="h-auto min-h-0 w-full justify-start bg-transparent px-0 py-0 text-left text-inherit shadow-none hover:translate-y-0 hover:shadow-none"
                  to={item.to}
                >
                  <span className="flex w-full items-center gap-4">
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${item.iconWrapClassName}`}
                    >
                      <item.icon className={`h-7 w-7 ${item.iconClassName}`} strokeWidth={2.2} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-2xl font-bold tracking-[-0.02em] text-tealDark">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-lg text-contentMid">{item.subtitle}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 text-contentLight" strokeWidth={2.2} />
                  </span>
                </Button>
              </SectionCard>
            ))}
          </div>
        </div>

        <SectionCard className="p-2">
          <div className="grid gap-2 rounded-full bg-primaryPale/70 p-2 md:grid-cols-3">
            {tabItems.map((item) => (
              <button
                key={item.id}
                className={
                  activeTab === item.id
                    ? 'flex min-h-[64px] items-center justify-center gap-3 rounded-full bg-surface px-6 text-xl font-semibold text-tealDark shadow-card'
                    : 'flex min-h-[64px] items-center justify-center gap-3 rounded-full px-6 text-xl font-medium text-contentMid transition-colors hover:text-tealDark'
                }
                onClick={() => setActiveTab(item.id)}
                type="button"
              >
                <item.icon className="h-5 w-5" strokeWidth={2.2} />
                {item.label}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-tealDark">
                {activeTabContent.heading}
              </h2>
              <p className="mt-3 max-w-[760px] text-lg leading-9 text-contentMid">
                {activeTabContent.description}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primaryPale px-4 py-2 text-sm font-semibold text-primary">
              <activeTabConfig.icon className="h-4 w-4" strokeWidth={2.2} />
              {isFallback ? '예시 데이터' : '연동 데이터'}
              <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {activeTabContent.bullets.map((bullet) => (
              <div
                key={bullet}
                className="rounded-[22px] border border-border bg-primaryPale/35 px-5 py-5 text-lg font-medium leading-8 text-tealDark"
              >
                {bullet}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="p-8">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-tealDark">최근 활동</h2>
          {mypageSummary.recentActivities.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {mypageSummary.recentActivities.map((activity) => (
                <div
                  key={`${activity.title}-${activity.detail}`}
                  className={`rounded-[22px] border border-border px-5 py-5 ${getRecentActivityTone(activity.type)}`}
                >
                  <p className="text-xl font-semibold tracking-[-0.02em]">{activity.title}</p>
                  <p className="mt-1 text-base opacity-80">{activity.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center rounded-[28px] border border-border bg-primaryPale/25 px-6 py-16 text-center">
              <Brain className="h-14 w-14 text-primary/30" strokeWidth={1.8} />
              <p className="mt-6 text-2xl font-semibold text-contentMid">
                아직 활동 기록이 없습니다.
              </p>
              <p className="mt-3 max-w-[560px] text-lg leading-8 text-contentLight">
                루틴을 수행하거나 인지훈련을 시작하면 최근 활동이 이곳에 쌓입니다.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
