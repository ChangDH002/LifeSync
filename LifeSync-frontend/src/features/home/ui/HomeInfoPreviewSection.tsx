import { Link } from 'react-router-dom'
import type { HomeInfoCard } from '../types'
import { SectionCard } from '@/shared/ui'

const infoCards: HomeInfoCard[] = [
  {
    title: '삶의 리듬이 어긋나는 신호 보기',
    body: '반복 질문, 일정 혼동, 잠과 기분의 흔들림처럼 일상에서 먼저 드러나는 작은 변화를 가볍게 점검해보세요.',
  },
  {
    title: '싱크를 되찾는 생활 습관',
    body: '수면, 식사, 운동, 대화 습관 중 지금 내 하루를 다시 안정시키는 데 도움이 되는 포인트만 골라 보여드립니다.',
  },
  {
    title: '가족이 도울 수 있는 방법',
    body: '불안을 줄이는 말투, 안전한 환경 만들기, 함께 리듬을 맞추는 방법을 생활 중심으로 확인할 수 있습니다.',
  },
  {
    title: 'LifeSync 가이드 한눈에 보기',
    body: '복잡한 의학 용어보다 일상 언어 중심으로 정리해, 바로 이해하고 생활에 옮길 수 있게 구성했습니다.',
  },
] as const

export function HomeInfoPreviewSection() {
  return (
    <section className="bg-primaryPale/45 py-20 md:py-24">
      <div className="page-shell">
        <div className="mx-auto max-w-[900px] text-center">
          <h2 className="section-title">LifeSync 가이드 미리 보기</h2>
          <p className="section-subtitle mt-4 text-lg md:text-[22px]">
            삶과 기억의 싱크를 다시 맞추는 데 도움이 되는 내용을 빠르게 읽고 바로 이어볼 수 있게 정리했습니다.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {infoCards.map((card) => (
            <Link
              key={card.title}
              className="block transition-transform duration-200 hover:-translate-y-1"
              to="/information"
            >
              <SectionCard className="min-h-[220px] border-primary/10 bg-surface/90">
                <div className="section-badge">LifeSync Guide</div>
                <h3 className="content-title mt-5 text-[24px]">{card.title}</h3>
                <p className="content-body mt-4 text-[18px] leading-9 text-contentLight">
                  {card.body}
                </p>
                <p className="mt-5 text-base font-semibold text-teal">가이드 페이지로 이동</p>
              </SectionCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
