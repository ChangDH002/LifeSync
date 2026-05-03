import {
  Activity,
  Brain,
  ClipboardList,
  Gamepad2,
  Leaf,
  MessageCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { Button, LogoMark, SectionCard } from '@/shared/ui'

const featureCards = [
  {
    icon: ClipboardList,
    title: '생활습관 설문',
    body: '수면, 식습관, 운동, 인지활동 등 생활습관을 분석하여 맞춤형 위험도를 파악합니다.',
    to: '/login',
  },
  {
    icon: MessageCircle,
    title: 'AI 챗봇 상담',
    body: '언제든지 AI 상담사와 대화하며 치매 예방에 관한 조언과 정서적 지지를 받을 수 있습니다.',
    to: '/chatbot',
  },
  {
    icon: Leaf,
    title: '맞춤 루틴 추천',
    body: '설문 결과를 바탕으로 수면, 식단, 운동 등 일상 루틴을 추천하고 실천을 도와드립니다.',
    to: '/routine',
  },
] as const

const secondaryFeatureCards = [
  {
    icon: Gamepad2,
    title: '인지훈련 게임',
    body: '기억력 카드, 숫자 기억하기 등 다양한 인지훈련 게임으로 뇌를 활성화하세요.',
    to: '/training',
  },
  {
    icon: Brain,
    title: '인지 건강 정보',
    body: '인지 건강 관리, 생활 습관, 예방 방법 등을 알기 쉬운 안내로 제공합니다.',
    to: '/information',
  },
  {
    icon: Activity,
    title: '활동 기록 관리',
    body: '루틴 수행 기록, 인지훈련 결과 등을 한눈에 확인하고 건강 변화를 추적하세요.',
    to: '/mypage',
  },
] as const

const dementiaInfoCards = [
  {
    title: '초기 신호 살펴보기',
    body: '최근 기억 저하, 반복 질문, 일정 혼동처럼 일상에서 먼저 보이는 변화를 가볍게 점검해보세요.',
  },
  {
    title: '예방 생활습관 정리',
    body: '수면, 식사, 운동, 대화 습관처럼 꾸준히 지키기 좋은 예방 포인트만 모아 보여드립니다.',
  },
  {
    title: '가족이 도울 수 있는 방법',
    body: '불안을 줄이는 말투, 안전한 환경 만들기, 병원 상담 전 준비사항을 쉽게 확인할 수 있습니다.',
  },
  {
    title: '인지 건강 정보 한눈에 보기',
    body: '복잡한 의학 용어 대신 생활 중심 설명으로 필요한 정보를 편안하게 이해할 수 있게 구성했습니다.',
  },
] as const

export function HomePage() {
  const allFeatureCards = [...featureCards, ...secondaryFeatureCards]

  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <section className="hero-surface">
        <div className="page-shell relative z-10 flex flex-col items-center py-24 text-center md:py-28 lg:py-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2 text-base font-semibold text-teal shadow-card">
            <LogoMark className="h-8 w-8" iconClassName="h-4 w-4" />
            AI 기반 치매 예방 서비스
          </div>
          <h1 className="max-w-[820px] text-5xl font-extrabold leading-[1.15] tracking-[-0.04em] text-tealDark md:text-[72px]">
            건강한 뇌를 위한
            <br />
            <span className="text-primary">일상의 동반자</span>
          </h1>
          <p className="mt-8 max-w-[900px] text-xl leading-10 text-contentMid md:text-[22px]">
            LifeSync는 여러분의 생활습관을 분석하고, AI 맞춤 루틴과 인지훈련으로 치매
            예방을 도와드립니다. 오늘부터 뇌 건강 관리를 시작해보세요.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asLink className="min-w-[220px] px-8 py-4 text-lg" to="/login">
              무료로 시작하기
            </Button>
            <Button asLink className="min-w-[220px] px-8 py-4 text-lg" to="/information" variant="secondary">
              인지 건강 정보 보기
            </Button>
          </div>
          <p className="mt-10 text-base leading-8 text-contentLight">
            본 서비스는 의료적 진단을 제공하지 않습니다. 건강 상담은 전문의에게 받으세요.
          </p>
        </div>
      </section>
      <section className="page-shell py-20 md:py-24">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="section-title md:text-[64px]">주요 기능</h2>
          <p className="section-subtitle mt-5 text-lg md:text-[22px]">
            인지 건강 관리를 위한 기능을 한 곳에서 이용하세요
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:auto-rows-fr">
          {allFeatureCards.map((card) => (
            <Link key={card.title} className="block h-full" to={card.to}>
              <SectionCard className="flex h-full min-h-[280px] flex-col p-8 md:p-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primaryPale text-3xl">
                  <card.icon className="h-8 w-8 text-primary" strokeWidth={2.2} />
                </div>
                <div className="mt-8 flex-1">
                  <h3 className="content-title text-[24px] md:text-[26px]">{card.title}</h3>
                  <p className="content-body mt-4 text-[18px] leading-9 text-contentLight">
                    {card.body}
                  </p>
                </div>
              </SectionCard>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-primaryPale/45 py-20 md:py-24">
        <div className="page-shell">
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="section-title">인지 건강 정보 미리 보기</h2>
            <p className="section-subtitle mt-4 text-lg md:text-[22px]">
              마지막 섹션은 정보 카드 중심으로 구성해 빠르게 읽고 바로 이동할 수 있게 정리했습니다.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {dementiaInfoCards.map((card) => (
              <Link
                key={card.title}
                className="block transition-transform duration-200 hover:-translate-y-1"
                to="/information"
              >
                <SectionCard className="min-h-[220px] border-primary/10 bg-surface/90">
                  <div className="section-badge">인지 건강 정보</div>
                  <h3 className="content-title mt-5 text-[24px]">{card.title}</h3>
                  <p className="content-body mt-4 text-[18px] leading-9 text-contentLight">
                    {card.body}
                  </p>
                  <p className="mt-5 text-base font-semibold text-teal">정보 페이지로 이동</p>
                </SectionCard>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <AppFooter />
    </main>
  )
}
