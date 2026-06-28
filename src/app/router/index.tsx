import { createBrowserRouter, Navigate } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "@presentation/components/ProtectedRoute";
import { AppLayout } from "@presentation/layouts/AppLayout";
import { DashboardPage } from "@presentation/pages/DashboardPage";
import { LoginPage } from "@presentation/pages/LoginPage";
import { ProfilePage } from "@presentation/pages/ProfilePage";
import { TaskWizardPage } from "@presentation/pages/TaskWizardPage";
import { PersonalizationPanel } from "@presentation/features/personalization/PersonalizationPanel";
import { AccountInfoTab } from "@presentation/features/profile/AccountInfoTab";

export const router = createBrowserRouter([
  {
    path: "/entrar",
    element: <GuestRoute />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "tarefas/:id", element: <TaskWizardPage /> },
          {
            path: "perfil",
            element: <ProfilePage />,
            children: [
              { path: "personalizacao", element: <PersonalizationPanel /> },
              { path: "conta", element: <AccountInfoTab /> },
            ],
          },
          { path: "personalizacao", element: <Navigate to="/perfil/personalizacao" replace /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
