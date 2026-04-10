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

const summaryCards = [
  {
    title: '연속 달성',
    value: '5',
    caption: '일 연속',
    icon: Flame,
    iconColor: 'text-secondary',
  },
  {
    title: '오늘 루틴',
    value: '2/3',
    caption: '완료',
    icon: CalendarCheck2,
    iconColor: 'text-primary',
  },
  {
    title: '주간 달성률',
    value: '68%',
    caption: '이번 주',
    icon: Activity,
    iconColor: 'text-blue-500',
  },
  {
    title: '인지훈련',
    value: '4',
    caption: '게임 완료',
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

const recentActivities = [
  {
    title: '아침 산책 루틴 완료',
    detail: '오늘 오전 8:10',
    toneClassName: 'bg-primaryPale text-tealDark',
  },
  {
    title: '기억력 카드 게임 플레이',
    detail: '어제 오후 7:30',
    toneClassName: 'bg-surface text-contentMid',
  },
  {
    title: '수면 습관 설문 저장',
    detail: '어제 오후 6:05',
    toneClassName: 'bg-surface text-contentMid',
  },
] as const

const tabItems = [
  {
    id: 'survey',
    label: '설문 결과',
    icon: ClipboardList,
    heading: '생활습관 설문 요약',
    description:
      '최근 설문을 기준으로 수면 리듬과 가벼운 운동 습관은 안정적이지만, 대화 빈도와 수분 섭취는 조금 더 챙기면 좋습니다.',
    bullets: ['수면 규칙성 양호', '하루 물 섭취량 보완 필요', '주 4회 이상 산책 유지 중'],
  },
  {
    id: 'routine',
    label: '루틴 기록',
    icon: CalendarCheck2,
    heading: '이번 주 루틴 진행 현황',
    description:
      '이번 주에는 총 9개의 루틴 중 6개를 완료했습니다. 저녁 스트레칭과 취침 전 화면 줄이기 루틴이 가장 잘 유지되고 있습니다.',
    bullets: ['저녁 스트레칭 3회 완료', '식후 산책 2회 완료', '취침 전 화면 줄이기 1회 완료'],
  },
  {
    id: 'training',
    label: '인지훈련',
    icon: Brain,
    heading: '인지훈련 요약',
    description:
      '최근에는 기억력 카드와 순서 맞추기 게임을 중심으로 진행하고 있습니다. 평균 반응 속도는 지난주보다 조금 더 좋아졌습니다.',
    bullets: ['기억력 카드 3회 플레이', '순서 맞추기 1회 플레이', '평균 정확도 82%'],
  },
] as const

type TabId = (typeof tabItems)[number]['id']

export function MypageSummary() {
  const [activeTab, setActiveTab] = useState<TabId>('survey')
  const navigate = useNavigate()
  const { logout } = useAuth()

  const activeTabContent = tabItems.find((item) => item.id === activeTab) ?? tabItems[0]
  const completedRoutines = 2
  const totalRoutines = 3
  const routineProgressWidth = `${(completedRoutines / totalRoutines) * 100}%`

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
                  안녕하세요, 강민님!
                </h2>
                <p className="mt-2 text-lg leading-8 text-contentMid">
                  오늘도 건강한 하루를 시작해볼까요?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-card">
              <ClipboardList className="h-4 w-4" strokeWidth={2.2} />
              설문 업데이트 필요
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-primary/20 bg-surface/60 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primaryPale text-primary">
                  <Activity className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-[-0.02em] text-tealDark">
                    생활습관 설문을 작성해주세요
                  </h3>
                  <p className="mt-1 text-lg leading-8 text-contentMid">
                    설문을 통해 현재 상태를 파악하고 맞춤형 루틴 추천을 받아보세요.
                  </p>
                </div>
              </div>
              <Button asLink className="px-7" to="/login">
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
                  강민 이
                </h2>
                <p className="mt-1 text-xl text-contentMid">jvmmf310@gmail.com</p>
                <p className="mt-1 text-lg text-contentLight">가입 1분 미만 후</p>
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
              <activeTabContent.icon className="h-4 w-4" strokeWidth={2.2} />
              최근 갱신
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
          {recentActivities.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {recentActivities.map((activity) => (
                <div
                  key={`${activity.title}-${activity.detail}`}
                  className={`rounded-[22px] border border-border px-5 py-5 ${activity.toneClassName}`}
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
