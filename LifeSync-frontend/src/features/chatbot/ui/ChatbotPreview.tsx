import { Button, SectionCard } from '@/shared/ui'

export function ChatbotPreview() {
  return (
    <SectionCard className="w-full">
      <div className="section-badge">Chatbot</div>
      <h2 className="content-title mt-4">
        삶의 리듬을 다시 정리해주는 AI 대화 도우미
      </h2>
      <p className="content-body mt-3">
        오늘 무엇이 어긋나 있었는지 돌아보고, 다음에 무엇부터 맞춰가면 좋을지 차분하게
        정리해주는 대화 공간입니다.
      </p>
      <Button asLink className="mt-6 px-7" to="/chatbot">
        챗봇 열기
      </Button>
    </SectionCard>
  )
}
