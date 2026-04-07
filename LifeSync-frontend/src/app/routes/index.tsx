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
  SettingsPage,
  TrainingPage,
} from '@/pages'

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
    element: <MypagePage />,
  },
  {
    path: ROUTE_PATHS.settings,
    element: <SettingsPage />,
  },
  {
    path: ROUTE_PATHS.avatar,
    element: <AvatarPage />,
  },
  {
    path: ROUTE_PATHS.training,
    element: <TrainingPage />,
  },
  {
    path: ROUTE_PATHS.information,
    element: <InformationPage />,
  },
  {
    path: ROUTE_PATHS.chatbot,
    element: <ChatbotPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
