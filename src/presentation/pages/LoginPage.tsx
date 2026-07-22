import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useLocation } from "react-router-dom";
import { reactivateUser } from "@app/composition/useCases";
import { useAuth } from "@app/providers/authContext";
import {
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from "@infrastructure/firebase/authService";
import { getAuthErrorCode, mapAuthError } from "@infrastructure/firebase/mapAuthError";
import { Button, ConfirmDialog, SegmentedControl, SuccessDialog } from "@shared/ui";
import "./LoginPage.css";

type LoginMode = "sign-in" | "sign-up";

export function LoginPage() {
  const { status, user, refreshSession } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<LoginMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(() => {
    const state = location.state as { accountDeactivated?: boolean } | null;
    if (state?.accountDeactivated) {
      window.history.replaceState({}, document.title);
      return "Sua conta foi desativada. Você pode reativá-la em até 90 dias ao criar conta com o mesmo e-mail.";
    }
    return null;
  });
  /** Cadastro com e-mail já existente: após sign-in, decide entre erro e reativação. */
  const signupConflictRef = useRef(false);

  const isLoading = isSubmitting || isGoogleLoading || isReactivating;
  const deactivatedDialogOpen = status === "deactivated";

  useEffect(() => {
    if (!signupConflictRef.current) {
      return;
    }

    if (status === "deactivated") {
      signupConflictRef.current = false;
      return;
    }

    if (status === "authenticated") {
      signupConflictRef.current = false;
      void signOutUser().then(() => {
        setErrorMessage("Este e-mail já está em uso. Tente entrar.");
      });
    }
  }, [status]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "sign-in") {
        await signInWithEmail(email.trim(), password);
        return;
      }

      try {
        await signUpWithEmail(email.trim(), password);
      } catch (error) {
        if (getAuthErrorCode(error) !== "auth/email-already-in-use") {
          throw error;
        }

        signupConflictRef.current = true;
        try {
          await signInWithEmail(email.trim(), password);
        } catch (signInError) {
          signupConflictRef.current = false;
          const code = getAuthErrorCode(signInError);
          if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
            setErrorMessage(
              "Este e-mail já possui uma conta. Use a senha correta para reativar ou entrar.",
            );
            return;
          }
          setErrorMessage(mapAuthError(error));
        }
      }
    } catch (error) {
      setErrorMessage(mapAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage(mapAuthError(error));
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function handleConfirmReactivate() {
    if (!user) {
      return;
    }

    setIsReactivating(true);
    setErrorMessage(null);

    try {
      await reactivateUser.execute(user.uid);
      setSuccessMessage("Conta reativada com sucesso. Seus dados e progresso foram restaurados.");
      await refreshSession();
    } catch (error: unknown) {
      console.error("[SeniorEase] Falha ao reativar conta:", error);
      setErrorMessage("Não foi possível reativar a conta. Tente novamente.");
      await signOutUser();
    } finally {
      setIsReactivating(false);
    }
  }

  async function handleCancelReactivate() {
    setIsReactivating(true);
    try {
      await signOutUser();
    } finally {
      setIsReactivating(false);
    }
  }

  return (
    <main className="login-page" aria-labelledby="login-heading">
      <div className="login-page__card">
        <p className="login-page__brand">SeniorEASE</p>
        <h1 id="login-heading" className="login-page__title">
          Bem-vindo(a) ao SeniorEASE!
        </h1>

        <SegmentedControl
          name="login-mode"
          value={mode}
          options={[
            { value: "sign-in", label: "Acessar minha conta" },
            { value: "sign-up", label: "Criar minha conta" },
          ]}
          onChange={setMode}
          ariaLabel="Escolha acessar minha conta ou criar minha conta"
        />

        <form
          className="login-page__form"
          onSubmit={(event) => void handleSubmit(event)}
          noValidate
        >
          <div className="login-page__field">
            <label className="login-page__label" htmlFor="login-email">
              E-mail
            </label>
            <input
              id="login-email"
              className="login-page__input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              required
              disabled={isLoading}
            />
          </div>

          <div className="login-page__field">
            <label className="login-page__label" htmlFor="login-password">
              Senha
            </label>
            <input
              id="login-password"
              className="login-page__input"
              type="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="login-page__submit"
            disabled={isLoading}
            aria-busy={isSubmitting}
          >
            {mode === "sign-in" ? "Acessar minha conta" : "Criar minha conta"}
          </Button>
        </form>

        <p className="login-page__divider" aria-hidden="true">
          ou
        </p>

        <Button
          type="button"
          variant="secondary"
          className="login-page__google"
          onClick={() => void handleGoogleSignIn()}
          disabled={isLoading}
          aria-busy={isGoogleLoading}
        >
          Entrar com Google
        </Button>

        {errorMessage ? (
          <p className="login-page__error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={deactivatedDialogOpen}
        title="Conta desativada encontrada"
        description="Existe uma conta desativada com este e-mail. Deseja reativá-la e recuperar todo o progresso e os dados anteriores?"
        confirmLabel="Sim, reativar minha conta"
        cancelLabel="Não, manter desativada"
        confirmVariant="primary"
        onConfirm={() => {
          void handleConfirmReactivate();
        }}
        onCancel={() => {
          void handleCancelReactivate();
        }}
      />

      <SuccessDialog
        open={successMessage !== null}
        title="Pronto"
        description={successMessage ?? ""}
        onClose={() => {
          setSuccessMessage(null);
        }}
      />
    </main>
  );
}
