import { privacyPolicyDocument } from '@/shared/content/legal'
import { LegalDocumentLayout } from '@/shared/ui'

export function PrivacyPolicyPage() {
  return <LegalDocumentLayout document={privacyPolicyDocument} />
}
