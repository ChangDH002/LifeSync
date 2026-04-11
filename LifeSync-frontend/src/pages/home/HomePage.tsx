import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import {
  HomeFeatureGridSection,
  HomeHeroSection,
  HomeInfoPreviewSection,
} from '@/features/home'

export function HomePage() {
  return (
    <main className="min-h-screen bg-base">
      <AppHeader />
      <HomeHeroSection />
      <HomeFeatureGridSection />
      <HomeInfoPreviewSection />
      <AppFooter />
    </main>
  )
}
