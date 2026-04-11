import { Link } from 'react-router-dom'
import type { HomeInfoCard } from '../types'
import { SectionCard } from '@/shared/ui'

const infoCards: HomeInfoCard[] = [
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

export function HomeInfoPreviewSection() {
  return (
    <section className="bg-primaryPale/45 py-20 md:py-24">
      <div className="page-shell">
        <div className="mx-auto max-w-[900px] text-center">
          <h2 className="section-title">인지 건강 정보 미리 보기</h2>
          <p className="section-subtitle mt-4 text-lg md:text-[22px]">
            마지막 섹션은 정보 카드 중심으로 구성해 빠르게 읽고 바로 이동할 수 있게 정리했습니다.
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
  )
}
