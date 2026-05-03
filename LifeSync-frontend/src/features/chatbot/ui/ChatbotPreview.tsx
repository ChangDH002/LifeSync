import { Button, SectionCard } from '@/shared/ui'

export function ChatbotPreview() {
  return (
    <SectionCard className="w-full">
      <div className="section-badge">Chatbot</div>
      <h2 className="content-title mt-4">
        질문을 천천히 입력해도 괜찮은 도움말 챗봇
      </h2>
      <p className="content-body mt-3">
        건강 관리, 서비스 이용 방법, 다음에 해야 할 일을 단계적으로 안내하는 도우미를 위한
        자리입니다.
      </p>
      <Button asLink className="mt-6 px-7" to="/chatbot">
        챗봇 열기
      </Button>
    </SectionCard>
  )
}
