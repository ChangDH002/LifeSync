import { Button, SectionCard } from '@/shared/ui'

export function ChatbotPreview() {
  return (
    <SectionCard className="w-full">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Chatbot</p>
      <h2 className="mt-4 text-2xl font-bold text-content">질문을 천천히 입력해도 괜찮은 도움말 챗봇</h2>
      <p className="mt-3 text-lg leading-8 text-content/80">
        건강 관리, 서비스 이용 방법, 다음에 해야 할 일을 단계적으로 안내하는 도우미를 위한
        자리입니다.
      </p>
      <Button asLink className="mt-6" to="/chatbot">
        챗봇 열기
      </Button>
    </SectionCard>
  )
}
