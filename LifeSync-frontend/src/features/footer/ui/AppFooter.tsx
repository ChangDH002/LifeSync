import { Link } from 'react-router-dom'
import {
  FOOTER_POLICY_ITEMS,
  FOOTER_SERVICE_LINKS,
  FOOTER_SUPPORT_ITEMS,
} from '@/shared/constants'
import { LogoMark } from '@/shared/ui'

export function AppFooter() {
  return (
    <footer className="mt-20 bg-tealDark px-4 pb-8 pt-12 text-white/70 md:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3 font-serif text-2xl font-black tracking-[-0.02em] text-white">
            <LogoMark />
            LifeSync
          </div>
          <p className="text-sm leading-7 text-white/65">
            사용자의 생활 습관, 기억 변화, 감정 상태, 설문 결과를 바탕으로 흐트러진
            하루의 리듬과 삶의 싱크를 다시 맞추도록 돕는 라이프 케어 서비스입니다.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/50">
            챗봇, 추천 루틴, 인지훈련을 통해 나에게 맞는 생활 흐름을 천천히 되찾는 경험을
            만드는 것을 목표로 합니다.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">서비스</h4>
          <div className="flex flex-col gap-2">
            {FOOTER_SERVICE_LINKS.map((item) => (
              <Link key={item.path} className="footer-link" to={item.path}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">지원</h4>
          <div className="flex flex-col gap-2">
            {FOOTER_SUPPORT_ITEMS.map((item) => (
              <span key={item} className="footer-link">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">법적 고지</h4>
          <div className="flex flex-col gap-2">
            {FOOTER_POLICY_ITEMS.map((item) => (
              <Link key={item.path} className="footer-link" to={item.path}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 flex w-full max-w-6xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
        <span>© 2025 LifeSync. 삶과 기억의 싱크를 맞춰주는 라이프 케어 서비스</span>
        <span>문의: support@lifesync.kr</span>
      </div>
      <div className="mx-auto mt-3 w-full max-w-6xl text-xs leading-6 text-white/35">
        본 서비스는 의료적 진단 서비스가 아니며, 생활 리듬 관리와 정보 제공을 목적으로
        합니다. 건강 관련 응답은 참고용으로 제공되며, 위험 신호가 의심되는 경우 전문가
        상담을 권고합니다.
      </div>
    </footer>
  )
}
