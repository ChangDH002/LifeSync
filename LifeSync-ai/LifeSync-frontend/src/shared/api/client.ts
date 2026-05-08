import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

/**
 * 공통 HTTP 클라이언트
 * 모든 API 요청은 이 클라이언트를 통해 처리
 */
export const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    // TODO: 글로벌 에러 처리 로직
    if (error.response?.status === 401) {
      // TODO: 토큰 갱신 또는 로그아웃 처리
      console.warn('Unauthorized - redirecting to login')
    }
    return Promise.reject(error)
  }
)

export default apiClient
