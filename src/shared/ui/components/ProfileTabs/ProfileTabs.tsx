import { NavLink } from "react-router-dom";
import "./ProfileTabs.css";

export function ProfileTabs() {
  return (
    <div className="profile-tabs" role="tablist" aria-label="Seções do perfil">
      <NavLink
        to="/perfil/personalizacao"
        role="tab"
        className={({ isActive }) =>
          `profile-tabs__tab ${isActive ? "profile-tabs__tab--active" : ""}`
        }
      >
        Personalização
      </NavLink>
      <NavLink
        to="/perfil/conta"
        role="tab"
        className={({ isActive }) =>
          `profile-tabs__tab profile-tabs__tab--secondary ${isActive ? "profile-tabs__tab--active" : ""}`
        }
      >
        Informações da conta
      </NavLink>
    </div>
  );
}
