import { termsOfServiceDocument } from '@/shared/content/legal'
import { LegalDocumentLayout } from '@/shared/ui'

export function TermsPage() {
  return <LegalDocumentLayout document={termsOfServiceDocument} />
}
