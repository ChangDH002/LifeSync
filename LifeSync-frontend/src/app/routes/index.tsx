import { createBrowserRouter } from 'react-router-dom'
import { ROUTE_PATHS } from '@/shared/config'
import {
  AvatarPage,
  ChatbotPage,
  HomePage,
  InformationPage,
  LoginPage,
  MypagePage,
  NotFoundPage,
  RoutinePage,
  SettingsPage,
  TrainingPage,
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
    path: ROUTE_PATHS.mypage,
    element: (
      <RequireAuth>
        <MypagePage />
      </RequireAuth>
    ),
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
    path: '*',
    element: <NotFoundPage />,
  },
])
