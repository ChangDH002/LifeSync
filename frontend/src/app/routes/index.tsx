import { createBrowserRouter } from 'react-router-dom'
import { ROUTE_PATHS } from '@/shared/config'
import {
  AvatarPage,
  AuthCallbackPage,
  ChatbotPage,
  HomePage,
  InformationPage,
  JudgmentGamePage,
  LanguageGamePage,
  LanguageGameResultPage,
  JudgmentGameResultPage,
  AttentionGameResultPage,
  LoginPage,
  MedicalNoticePage,
  MemoryGamePage,
  MemoryGameResultPage,
  MypagePage,
  NotFoundPage,
  PrivacyPolicyPage,
  RoutinePage,
  SettingsPage,
  SignupPage,
  TermsPage,
  AttentionGamePage,
  TrainingPage,
  SurveyPage, 
} from '@/pages'
import { RequireAuth } from './RequireAuth'

// GitHub Pages 하위 경로(/LifeSync/) 배포를 위해 Vite base 값과 라우터 basename을 맞춘다.
// import.meta.env.BASE_URL은 빌드 시 '/LifeSync/' 이며, 끝의 슬래시는 제거한다.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createBrowserRouter(
  [
  {
    path: ROUTE_PATHS.home,
    element: <HomePage />,
  },
  {
    path: ROUTE_PATHS.login,
    element: <LoginPage />,
  },
  {
    path: ROUTE_PATHS.signup,
    element: <SignupPage />,
  },
  {
    path: `${ROUTE_PATHS.authCallback}/:provider`,
    element: <AuthCallbackPage />,
  },
  {
    path: ROUTE_PATHS.mypage,
    element: (
      <RequireAuth>
        <MypagePage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.survey,
    element: <SurveyPage />,
  },
  {
    path: ROUTE_PATHS.settings,
    element: (
      <RequireAuth>
        <SettingsPage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.avatar,
    element: (
      <RequireAuth>
        <AvatarPage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.routine,
    element: (
      <RequireAuth>
        <RoutinePage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.training,
    element: (
      <RequireAuth>
        <TrainingPage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.trainingMemory,
    element: (
      <RequireAuth>
        <MemoryGamePage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.trainingMemoryResult,
    element: (
      <RequireAuth>
        <MemoryGameResultPage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.trainingJudgment,
    element: (
      <RequireAuth>
        <JudgmentGamePage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.trainingJudgmentResult,
    element: (
      <RequireAuth>
        <JudgmentGameResultPage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.trainingAttention,
    element: (
      <RequireAuth>
        <AttentionGamePage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.trainingAttentionResult,
    element: (
      <RequireAuth>
        <AttentionGameResultPage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.trainingLanguage,
    element: (
      <RequireAuth>
        <LanguageGamePage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.trainingLanguageResult,
    element: (
      <RequireAuth>
        <LanguageGameResultPage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.information,
    element: <InformationPage />,
  },
  {
    path: ROUTE_PATHS.chatbot,
    element: (
      <RequireAuth>
        <ChatbotPage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTE_PATHS.terms,
    element: <TermsPage />,
  },
  {
    path: ROUTE_PATHS.privacy,
    element: <PrivacyPolicyPage />,
  },
  {
    path: ROUTE_PATHS.medicalNotice,
    element: <MedicalNoticePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
  ],
  { basename }
)
