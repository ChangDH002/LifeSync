import { SectionCard } from '@/shared/ui'

export function SettingsSummary() {
  return (
    <SectionCard className="w-full">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Settings</p>
      <h1 className="mt-4 text-3xl font-bold text-content">접근성과 알림 설정</h1>
      <p className="mt-3 text-lg leading-8 text-content/80">
        글자 크기, 알림 허용 여부, 계정 보호 설정처럼 앱 전체에 영향을 주는 상태를 관리하는
        영역입니다.
      </p>
    </SectionCard>
  )
}
