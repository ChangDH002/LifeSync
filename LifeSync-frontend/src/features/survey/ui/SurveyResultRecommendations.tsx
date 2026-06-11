import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { SectionCard } from '@/shared/ui'

interface ActionableRecommendation {
  title: string
  description: string
  actionLink: string
  category: string
}

interface SurveyResultRecommendationsProps {
  recommendations: ActionableRecommendation[]
}

export function SurveyResultRecommendations({ recommendations }: SurveyResultRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2">
        <Sparkles className="h-7 w-7 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight text-tealDark md:text-3xl">맞춤 실천 과제</h2>
      </div>
      <p className="mt-3 text-lg text-contentMid">
        설문 결과를 바탕으로, 오늘 바로 시작할 수 있는 활동을 추천해 드려요.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-1">
        {recommendations.map((rec) => (
          <Link key={rec.title} to={rec.actionLink} className="group block rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg">
            <SectionCard className="flex h-full items-center justify-between p-6 group-hover:border-primary/40 group-hover:bg-primaryPale/40">
              <div className="flex-1">
                <div className="section-badge">{rec.category}</div>
                <h3 className="content-title mt-3 text-xl">{rec.title}</h3>
                <p className="content-body mt-2 text-base leading-relaxed text-content">{rec.description}</p>
              </div>
              <div className="ml-4">
                <ArrowRight className="h-6 w-6 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </SectionCard>
          </Link>
        ))}
      </div>
    </div>
  )
}