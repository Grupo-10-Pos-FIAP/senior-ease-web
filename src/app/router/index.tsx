import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@presentation/layouts/AppLayout'
import { DashboardPage } from '@presentation/pages/DashboardPage'
import { ProfilePage } from '@presentation/pages/ProfilePage'
import { PersonalizationPanel } from '@presentation/features/personalization/PersonalizationPanel'
import { AccountInfoTab } from '@presentation/features/profile/AccountInfoTab'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'perfil',
        element: <ProfilePage />,
        children: [
          { path: 'personalizacao', element: <PersonalizationPanel /> },
          { path: 'conta', element: <AccountInfoTab /> },
        ],
      },
      { path: 'personalizacao', element: <Navigate to="/perfil/personalizacao" replace /> },
    ],
  },
])
