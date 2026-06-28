import { NavLink } from "react-router-dom";
import { useAuth } from "@app/providers/authContext";
import { signOutUser } from "@infrastructure/firebase/authService";
import { Button } from "@shared/ui/components/Button";
import "./AppHeader.css";

export function AppHeader() {
  const { status } = useAuth();

  async function handleSignOut() {
    await signOutUser();
  }

  return (
    <header className="app-header">
      <div className="app-header__inner">
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
            aria-label="Sair da conta"
            disabled={status !== "authenticated"}
            onClick={() => void handleSignOut()}
          >
            Sair
          </Button>
        </nav>
      </div>
    </header>
  );
}
