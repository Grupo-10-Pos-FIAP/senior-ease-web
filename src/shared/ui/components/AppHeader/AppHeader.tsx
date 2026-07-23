import { NavLink } from "react-router-dom";
import { useAuth } from "@app/providers/authContext";
import { useConfirmCriticalAction } from "@presentation/hooks/useConfirmCriticalAction";
import { signOutUser } from "@infrastructure/firebase/authService";
import { Button } from "@shared/ui/components/Button";
import { ConfirmDialog } from "@shared/ui/components/ConfirmDialog";
import "./AppHeader.css";

export function AppHeader() {
  const { status } = useAuth();
  const { pending, runIfAllowed, confirm, cancel, isOpen } = useConfirmCriticalAction();

  function handleSignOutClick() {
    runIfAllowed(
      () => {
        void signOutUser();
      },
      {
        title: "Sair da sua conta?",
        description:
          "Você precisará entrar novamente para acessar suas atividades e preferências salvas.",
        confirmLabel: "Sim, sair da conta",
        cancelLabel: "Não, continuar aqui",
        confirmVariant: "warning",
      },
    );
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
              aria-haspopup={pending ? "dialog" : undefined}
              aria-expanded={isOpen}
              disabled={status !== "authenticated"}
              onClick={handleSignOutClick}
            >
              Sair
            </Button>
          </nav>
        </div>
      </header>

      <ConfirmDialog
        open={isOpen}
        title={pending?.options.title ?? ""}
        description={pending?.options.description ?? ""}
        confirmLabel={pending?.options.confirmLabel}
        cancelLabel={pending?.options.cancelLabel}
        confirmVariant={pending?.options.confirmVariant}
        onConfirm={confirm}
        onCancel={cancel}
      />
    </>
  );
}
