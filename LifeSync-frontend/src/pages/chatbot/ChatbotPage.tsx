import { ChatbotWorkspace } from '@/features/chatbot'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'

export function ChatbotPage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <div className="page-shell mx-auto flex w-full max-w-[1320px] py-6 md:py-8">
        <ChatbotWorkspace />
      </div>
      <AppFooter />
    </main>
  )
}
