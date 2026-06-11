export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
) {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallbackMessage
  }

  const response = (error as { response?: { data?: unknown } }).response
  const payload = response?.data

  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (typeof payload !== 'object' || payload === null) {
    return fallbackMessage
  }

  if ('detail' in payload && Array.isArray((payload as { detail?: unknown }).detail)) {
    const firstDetail = (payload as { detail?: Array<{ msg?: unknown }> }).detail?.[0]
    if (firstDetail && typeof firstDetail.msg === 'string' && firstDetail.msg.trim()) {
      return firstDetail.msg
    }
  }

  if ('message' in payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  if ('error' in payload && typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error
  }

  if ('detail' in payload && typeof payload.detail === 'string' && payload.detail.trim()) {
    return payload.detail
  }

  return fallbackMessage
}
