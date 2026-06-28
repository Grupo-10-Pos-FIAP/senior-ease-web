import { NavLink, useLocation } from "react-router-dom";
import "./ProfileTabs.css";

interface ProfileTabProps {
  to: string;
  label: string;
}

function ProfileTab({ to, label }: ProfileTabProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      role="tab"
      aria-selected={isActive}
      className={`profile-tabs__tab ${isActive ? "profile-tabs__tab--active" : ""}`}
    >
      {label}
    </NavLink>
  );
}

export function ProfileTabs() {
  return (
    <div className="profile-tabs" role="tablist" aria-label="Seções do perfil">
      <ProfileTab to="/perfil/personalizacao" label="Personalização" />
      <ProfileTab to="/perfil/conta" label="Informações da conta" />
    </div>
  );
}
