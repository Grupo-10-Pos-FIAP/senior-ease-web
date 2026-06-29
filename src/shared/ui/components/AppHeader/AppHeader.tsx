import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@app/providers/authContext";
import { signOutUser } from "@infrastructure/firebase/authService";
import { Button } from "@shared/ui/components/Button";
import { ConfirmDialog } from "@shared/ui/components/ConfirmDialog";
import "./AppHeader.css";

export function AppHeader() {
  const { status } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  async function handleConfirmSignOut() {
    await signOutUser();
    setShowSignOutDialog(false);
  }

  return (
    <>
    <header className="app-header">
      <div className="app-header__inner">
        <NavLink to="/" className="app-header__logo" aria-label="SeniorEASE — início">
          SeniorEASE
        </NavLink>
        <nav className="app-header__nav" aria-label="Navegação principal">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `app-header__link ${isActive ? "app-header__link--active" : ""}`
            }
          >
            Minhas atividades
          </NavLink>
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
            aria-haspopup="dialog"
            aria-expanded={showSignOutDialog}
            disabled={status !== "authenticated"}
            onClick={() => setShowSignOutDialog(true)}
          >
            Sair
          </Button>
        </nav>
      </div>
    </header>

    <ConfirmDialog
      open={showSignOutDialog}
      title="Sair da sua conta?"
      description="Você precisará entrar novamente para acessar suas atividades e preferências salvas."
      confirmLabel="Sim, sair da conta"
      cancelLabel="Não, continuar aqui"
      confirmVariant="warning"
      onConfirm={() => void handleConfirmSignOut()}
      onCancel={() => setShowSignOutDialog(false)}
    />
    </>
  );
}
