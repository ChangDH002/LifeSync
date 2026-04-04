import { ReactNode } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

interface ProvidersProps {
  children: ReactNode
}

/**
 * 전역 Provider 조합
 * - React Query (서버 상태)
 * - Theme Provider (필요 시)
 * - Context Providers (필요 시)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* TODO: 추가 providers 연결 */}
      {children}
    </QueryClientProvider>
  )
}
