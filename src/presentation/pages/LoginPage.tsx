import { useState, type SubmitEvent } from "react";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@infrastructure/firebase/authService";
import { mapAuthError } from "@infrastructure/firebase/mapAuthError";
import { Button, SegmentedControl } from "@shared/ui";
import "./LoginPage.css";

type LoginMode = "sign-in" | "sign-up";

export function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isLoading = isSubmitting || isGoogleLoading;

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
      } else {
        await signUpWithEmail(email.trim(), password);
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

  return (
    <main className="login-page" aria-labelledby="login-heading">
      <div className="login-page__card">
        <p className="login-page__brand">SeniorEASE</p>
        <h1 id="login-heading" className="login-page__title">
          Bem-vindo(a)
        </h1>
        <p className="login-page__subtitle">Entre para continuar</p>

        <SegmentedControl
          name="login-mode"
          value={mode}
          options={[
            { value: "sign-in", label: "Entrar" },
            { value: "sign-up", label: "Criar conta" },
          ]}
          onChange={setMode}
          ariaLabel="Escolha entrar ou criar conta"
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
            {mode === "sign-in" ? "Entrar" : "Criar minha conta"}
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
    </main>
  );
}
