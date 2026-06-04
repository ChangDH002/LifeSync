import {
  Activity,
  Brain,
  ClipboardList,
  Gamepad2,
  Leaf,
  MessageCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { HomeFeatureCard } from '../types'
import { SectionCard } from '@/shared/ui'

const primaryFeatureCards: HomeFeatureCard[] = [
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

const secondaryFeatureCards: HomeFeatureCard[] = [
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

export function HomeFeatureGridSection() {
  const featureCards = [...primaryFeatureCards, ...secondaryFeatureCards]

  return (
    <section className="page-shell py-20 md:py-24">
      <div className="mx-auto max-w-[820px] text-center">
        <h2 className="section-title md:text-[64px]">주요 기능</h2>
        <p className="section-subtitle mt-5 text-lg md:text-[22px]">
          인지 건강 관리를 위한 기능을 한 곳에서 이용하세요
        </p>
      </div>
      <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:auto-rows-fr">
        {featureCards.map((card) => (
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
  )
}
