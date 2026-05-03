import { Droplets, LoaderCircle, Menu, MoveLeft, ShoppingBag, Sparkles } from 'lucide-react'
import soilImage from '@/shared/assets/trees/soil.svg'
import { Button, SectionCard } from '@/shared/ui'
import { useAvatar } from '../hooks'

export function AvatarSummary() {
  const {
    avatar,
    canWaterToday,
    currentStageAsset,
    error,
    isLoading,
    isMaxStage,
    isRemoteMode,
    isWatering,
    nextStageExperienceGoal,
    progressWithinStage,
    statusMessage,
    waterTree,
  } = useAvatar()
  const treeImageClassName = isMaxStage
    ? 'max-h-full max-w-full scale-[1.03] object-contain drop-shadow-[0_18px_30px_rgba(45,110,107,0.2)] transition-transform duration-500'
    : 'max-h-full max-w-full object-contain drop-shadow-[0_14px_24px_rgba(45,110,107,0.16)] transition-transform duration-500'
  const growthStatusLabel = isLoading
    ? '상태 불러오는 중'
    : isRemoteMode
      ? canWaterToday
        ? '물 주기 가능'
        : '오늘 물주기 완료'
      : '로컬 성장 모드'

  const statusCards = [
    {
      label: '현재 단계',
      value: `${currentStageAsset.title} · ${avatar.stage}단계`,
      note: isMaxStage ? '최종 단계까지 건강하게 성장했어요.' : '물주기로 다음 단계까지 차근차근 자라고 있어요.',
    },
    {
      label: '오늘의 성장 포인트',
      value: `총 ${avatar.experience} XP`,
      note:
        error ??
        statusMessage ??
        `물을 준 횟수 ${avatar.waterCount}회가 차곡차곡 반영되고 있어요.`,
    },
  ]

  return (
    <section className="w-full">
      <SectionCard className="hero-surface relative overflow-hidden rounded-[28px] border-primary/20 px-4 py-4 shadow-cardLg md:rounded-[36px] md:px-7 md:py-6">
        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-tealDark/10 pb-4">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-tealDark shadow-card transition-colors hover:bg-white"
              type="button"
            >
              <MoveLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Tree Garden</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-tealDark md:text-[34px]">
                나무 키우기
              </h1>
            </div>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-tealDark shadow-card transition-colors hover:bg-white"
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-4">
              {statusCards.map((card) => (
                <SectionCard
                  className="rounded-[24px] border-white/60 bg-white/75 p-5 shadow-card"
                  key={card.label}
                >
                  <p className="text-sm font-semibold tracking-[0.1em] text-primary">{card.label}</p>
                  <p className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-tealDark">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-contentMid">{card.note}</p>
                </SectionCard>
              ))}

              <SectionCard className="rounded-[24px] border-white/60 bg-white/75 p-5 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-[0.1em] text-primary">경험치</p>
                    <p className="mt-2 text-xl font-extrabold tracking-[-0.02em] text-tealDark">
                      {avatar.experience} / {avatar.maxExperience} XP
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primaryPale text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-primaryPale">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-teal transition-[width] duration-500"
                    style={{ width: `${Math.max(progressWithinStage, 8)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-7 text-contentMid">
                  {isMaxStage
                    ? '최종 성장 단계에 도달해서 이제는 건강한 상태를 유지하는 중이에요.'
                    : `다음 단계까지 ${Math.max(nextStageExperienceGoal - avatar.experience, 0)} XP 남았어요.`}
                </p>
              </SectionCard>
            </div>

            <div className="relative min-h-[560px] rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(228,243,235,0.72)_65%,rgba(193,225,208,0.92)_100%)] p-4 shadow-card md:min-h-[680px] md:p-6">
              <div className="absolute inset-x-6 top-6 flex items-start justify-between">
                <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold tracking-[0.08em] text-primary shadow-card">
                  오늘의 배경
                </div>
                <div className="rounded-[20px] bg-white/78 px-4 py-3 text-right shadow-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    성장 요약
                  </p>
                  <p className="mt-1 text-lg font-bold text-tealDark">{growthStatusLabel}</p>
                </div>
              </div>

              <div className="flex min-h-[500px] flex-col items-center justify-center px-2 pb-24 pt-14 md:min-h-[620px] md:pb-32 md:pt-16">
                <div className="relative flex w-full max-w-[720px] flex-col items-center justify-center text-center">
                  <div
                    className={
                      isMaxStage
                        ? 'absolute bottom-[48px] h-28 w-[320px] rounded-[999px] bg-primary/14 blur-xl md:bottom-[72px] md:h-32 md:w-[460px]'
                        : 'absolute bottom-[48px] h-24 w-[280px] rounded-[999px] bg-primary/10 blur-xl md:bottom-[72px] md:h-28 md:w-[420px]'
                    }
                  />
                  <div className="relative flex h-[380px] w-full items-end justify-center md:h-[520px]">
                    <div className="absolute bottom-0 flex w-[320px] items-center justify-center md:w-[500px]">
                      <img
                        alt=""
                        aria-hidden="true"
                        className="w-full object-contain drop-shadow-[0_10px_14px_rgba(45,110,107,0.12)]"
                        src={soilImage}
                      />
                    </div>
                    <div className="absolute bottom-[34px] flex h-[320px] w-[280px] items-end justify-center md:bottom-[38px] md:h-[470px] md:w-[460px]">
                      <img
                        alt={currentStageAsset.title}
                        className={treeImageClassName}
                        src={currentStageAsset.imageSrc}
                      />
                    </div>
                  </div>
                  <p className="mt-6 text-3xl font-extrabold tracking-[-0.03em] text-tealDark">
                    {avatar.name}
                  </p>
                  {isMaxStage ? (
                    <div className="mt-3 rounded-full bg-white/78 px-4 py-2 text-sm font-semibold tracking-[0.08em] text-primary shadow-card">
                      최종 성장 완료
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                <div className="flex flex-col gap-4 rounded-[24px] bg-white/78 px-4 py-4 shadow-card backdrop-blur-sm md:flex-row md:items-end md:justify-between md:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-extrabold tracking-[-0.02em] text-tealDark md:text-lg">
                      {currentStageAsset.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-content md:text-base">
                      {currentStageAsset.description}
                    </p>
                    {statusMessage ? (
                      <p className="mt-2 text-sm leading-7 text-contentMid">{statusMessage}</p>
                    ) : null}
                    {error ? <p className="mt-2 text-sm font-medium leading-7 text-danger">{error}</p> : null}
                  </div>

                  <div className="flex shrink-0 items-end gap-3 self-end">
                    <Button className="min-h-[50px] rounded-2xl bg-white/82 px-5 text-base font-bold text-tealDark shadow-card hover:bg-white md:min-h-[58px] md:px-6 md:text-lg">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      상점
                    </Button>

                    <Button
                      className="min-h-[56px] rounded-[22px] px-5 shadow-cardLg md:min-h-[62px] md:px-7"
                      disabled={isLoading || isWatering || !canWaterToday}
                      onClick={() => void waterTree()}
                    >
                      {isWatering ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <Droplets className="mr-2 h-5 w-5" />}
                      {isLoading ? '불러오는 중...' : isWatering ? '반영 중...' : canWaterToday ? '물주기' : '오늘 완료'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </section>
  )
}
