import { useEffect, useState } from 'react'

type ViewportMode = 'mobile' | 'tablet' | 'web'

function getViewportMode(): ViewportMode {
  if (typeof window === 'undefined') {
    return 'web'
  }

  const width = window.innerWidth

  if (width <= 767) {
    return 'mobile'
  }

  if (width <= 1023) {
    return 'tablet'
  }

  return 'web'
}

export function useViewportMode() {
  const [viewportMode, setViewportMode] = useState<ViewportMode>(() => getViewportMode())

  useEffect(() => {
    const handleChange = () => {
      setViewportMode(getViewportMode())
    }

    handleChange()
    window.addEventListener('resize', handleChange)

    return () => window.removeEventListener('resize', handleChange)
  }, [])

  return {
    isMobile: viewportMode === 'mobile',
    isTablet: viewportMode === 'tablet',
    isWeb: viewportMode === 'web',
    viewportMode,
  }
}
