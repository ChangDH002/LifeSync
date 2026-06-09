import { Button, LogoMark } from '@/shared/ui'

export function HomeHeroSection() {
  return (
    <section className="hero-surface">
      <div className="page-shell relative z-10 flex flex-col items-center py-24 text-center md:py-28 lg:py-32">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2 text-base font-semibold text-teal shadow-card">
          <LogoMark className="h-8 w-8" iconClassName="h-4 w-4" />
          일상과 기억의 싱크를 맞추는 LifeSync
        </div>
        <h1 className="max-w-[820px] text-5xl font-extrabold leading-[1.15] tracking-[-0.04em] text-tealDark md:text-[72px]">
          흐트러진 하루와
          <br />
          <span className="text-primary">기억의 리듬을 다시 맞추세요</span>
        </h1>
        <p className="mt-8 max-w-[900px] text-xl leading-10 text-contentMid md:text-[22px]">
          LifeSync는 수면, 활동, 감정, 기억 습관처럼 어긋나기 쉬운 일상의 흐름을 살펴보고,
          맞춤 루틴과 인지훈련, AI 대화로 다시 나에게 맞는 생활 리듬을 찾도록 돕습니다.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asLink className="min-w-[220px] px-8 py-4 text-lg" to="/login">
            무료로 시작하기
          </Button>
          <Button asLink className="min-w-[220px] px-8 py-4 text-lg" to="/information" variant="secondary">
            라이프싱크 가이드 보기
          </Button>
        </div>
        <p className="mt-10 text-base leading-8 text-contentLight">
          본 서비스는 의료적 진단을 대신하지 않으며, 생활 리듬 관리와 정보 제공을 중심으로 동작합니다.
        </p>
      </div>
    </section>
  )
}
