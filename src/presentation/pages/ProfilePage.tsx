import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ProfileTabs } from "@shared/ui";
import "./ProfilePage.css";

export function ProfilePage() {
  const location = useLocation();

  if (location.pathname === "/perfil") {
    return <Navigate to="/perfil/personalizacao" replace />;
  }

  return (
    <div className="profile-page">
      <ProfileTabs />
      <Outlet />
    </div>
  );
}
