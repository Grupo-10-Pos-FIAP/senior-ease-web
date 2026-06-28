import { NavLink } from "react-router-dom";
import { Button } from "@shared/ui/components/Button";
import "./AppHeader.css";

export function AppHeader() {
  return (
    <header className="app-header">
      <NavLink to="/" className="app-header__logo" aria-label="SeniorEASE — início">
        SeniorEASE
      </NavLink>
      <nav className="app-header__nav" aria-label="Navegação principal">
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `app-header__link ${isActive ? "app-header__link--active" : ""}`
          }
        >
          Meu perfil
        </NavLink>
        <Button
          variant="ghost"
          className="app-header__action--secondary"
          aria-label="Sair (em breve)"
          disabled
        >
          Sair
        </Button>
      </nav>
    </header>
  );
}
