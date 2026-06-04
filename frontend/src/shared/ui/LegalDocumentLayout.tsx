import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import {
  type LegalDocument,
  legalDraftGuide,
} from '@/shared/content/legal'
import { SectionCard } from '@/shared/ui/SectionCard'

interface LegalDocumentLayoutProps {
  document: LegalDocument
}

export function LegalDocumentLayout({ document }: LegalDocumentLayoutProps) {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="page-shell flex flex-col gap-6 py-12">
        <SectionCard>
          <div className="section-badge">{document.category}</div>
          <h1 className="section-title mt-4">{document.title}</h1>
          <p className="section-subtitle mt-3">{document.summary}</p>
          <div className="mt-6 grid gap-3 rounded-2xl bg-primaryPale/50 p-5 text-base leading-8 text-contentMid">
            <p className="font-semibold text-tealDark">{document.notice}</p>
            <p>시행일: {document.effectiveDate}</p>
            <p>최종수정일: {document.revisionDate}</p>
          </div>
        </SectionCard>

        <SectionCard className="border-primary/20">
          <div className="section-badge">작성 전 확인</div>
          <div className="mt-4 space-y-3 text-base leading-8 text-contentMid">
            {legalDraftGuide.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </SectionCard>

        {document.sections.map((section) => (
          <SectionCard key={section.title}>
            <h2 className="content-title text-[24px]">{section.title}</h2>
            <div className="mt-4 space-y-3 text-base leading-8 text-contentMid">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {section.bullets ? (
              <ul className="mt-5 space-y-2 text-base leading-8 text-contentMid">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </SectionCard>
        ))}
      </div>
      <AppFooter />
    </main>
  )
}
