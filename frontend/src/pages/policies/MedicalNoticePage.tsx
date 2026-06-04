import { medicalNoticeDocument } from '@/shared/content/legal'
import { LegalDocumentLayout } from '@/shared/ui'

export function MedicalNoticePage() {
  return <LegalDocumentLayout document={medicalNoticeDocument} />
}
