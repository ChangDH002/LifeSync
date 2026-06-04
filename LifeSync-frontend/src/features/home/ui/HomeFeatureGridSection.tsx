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
    title: '라이프 싱크 체크',
    body: '수면, 활동, 감정, 기억 습관을 함께 살펴보며 지금 내 일상 리듬이 어디에서 어긋나 있는지 확인합니다.',
    to: '/login',
  },
  {
    icon: MessageCircle,
    title: 'AI 싱크 코치',
    body: '하루가 흐트러졌다고 느껴질 때, 다음에 무엇을 하면 좋을지 차분하게 정리해주는 대화형 도우미입니다.',
    to: '/chatbot',
  },
  {
    icon: Leaf,
    title: '맞춤 루틴 추천',
    body: '지금 내 생활 패턴에 맞는 수면, 식사, 운동 루틴을 제안해 일상의 싱크를 조금씩 회복하도록 돕습니다.',
    to: '/routine',
  },
] as const

const secondaryFeatureCards: HomeFeatureCard[] = [
  {
    icon: Gamepad2,
    title: '인지훈련 게임',
    body: '기억력과 집중력을 깨우는 짧은 훈련으로 하루의 감각과 사고 흐름을 다시 정돈해보세요.',
    to: '/training',
  },
  {
    icon: Brain,
    title: '라이프 가이드',
    body: '기억, 수면, 대화, 활동 습관을 생활 언어로 풀어내어 바로 이해하고 적용할 수 있게 정리합니다.',
    to: '/information',
  },
  {
    icon: Activity,
    title: '활동 기록 관리',
    body: '루틴, 설문, 훈련 기록을 한 곳에 모아 내가 얼마나 다시 싱크를 찾아가고 있는지 살펴볼 수 있습니다.',
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
          삶의 리듬과 기억의 싱크를 다시 맞추는 기능을 한 곳에 모았습니다
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
