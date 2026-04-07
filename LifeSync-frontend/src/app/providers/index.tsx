import { ReactNode } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
})

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
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
