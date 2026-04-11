import { Button, LogoMark } from '@/shared/ui'

export function HomeHeroSection() {
  return (
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
  )
}
