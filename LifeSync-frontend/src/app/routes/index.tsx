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
  LoginPage,
  MedicalNoticePage,
  MemoryGamePage,
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

export const router = createBrowserRouter([
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
    path: ROUTE_PATHS.trainingJudgment,
    element: (
      <RequireAuth>
        <JudgmentGamePage />
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
    path: ROUTE_PATHS.trainingLanguage,
    element: (
      <RequireAuth>
        <LanguageGamePage />
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
])
