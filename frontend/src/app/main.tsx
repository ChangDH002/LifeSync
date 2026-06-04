import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { Providers } from './providers'
import '@/styles/globals.css'

function ensureLinkTag(attributes: Record<string, string>) {
  const selector = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('')

  if (document.head.querySelector(`link${selector}`)) {
    return
  }

  const link = document.createElement('link')
  Object.entries(attributes).forEach(([key, value]) => {
    link.setAttribute(key, value)
  })
  document.head.appendChild(link)
}

function setupDocumentHead() {
  document.documentElement.lang = 'ko'
  document.title = 'LifeSync'

  let descriptionMeta = document.head.querySelector('meta[name="description"]')
  if (!descriptionMeta) {
    descriptionMeta = document.createElement('meta')
    descriptionMeta.setAttribute('name', 'description')
    document.head.appendChild(descriptionMeta)
  }
  descriptionMeta.setAttribute('content', 'LifeSync - 시니어 건강 관리 플랫폼')

  ensureLinkTag({ rel: 'preconnect', href: 'https://fonts.googleapis.com' })
  ensureLinkTag({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' })
  ensureLinkTag({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&family=Noto+Serif+KR:wght@700;900&display=swap',
  })
}

setupDocumentHead()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
)
