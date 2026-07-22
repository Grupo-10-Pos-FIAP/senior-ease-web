import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@app/providers/authContext";
import { LoginPage } from "@presentation/pages/LoginPage";

const authMocks = vi.hoisted(() => ({
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
  reactivateUser: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock("@infrastructure/firebase/authService", () => ({
  signInWithEmail: authMocks.signInWithEmail,
  signUpWithEmail: authMocks.signUpWithEmail,
  signInWithGoogle: authMocks.signInWithGoogle,
  signOutUser: authMocks.signOutUser,
}));

vi.mock("@app/composition/useCases", () => ({
  reactivateUser: { execute: authMocks.reactivateUser },
}));

function renderLoginPage(
  auth: { status?: "unauthenticated" | "deactivated" | "authenticated"; uid?: string } = {},
) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          user: auth.uid ? { uid: auth.uid, email: "test@example.com" } : null,
          status: auth.status ?? "unauthenticated",
          refreshSession: authMocks.refreshSession,
        }}
      >
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    authMocks.signInWithEmail.mockReset();
    authMocks.signUpWithEmail.mockReset();
    authMocks.signInWithGoogle.mockReset();
    authMocks.signOutUser.mockReset();
    authMocks.reactivateUser.mockReset();
    authMocks.refreshSession.mockReset();
    authMocks.signInWithEmail.mockResolvedValue({ uid: "user-1", email: "test@example.com" });
    authMocks.signUpWithEmail.mockResolvedValue({ uid: "user-1", email: "test@example.com" });
    authMocks.signInWithGoogle.mockResolvedValue({ uid: "user-1", email: "test@example.com" });
    authMocks.signOutUser.mockResolvedValue(undefined);
    authMocks.reactivateUser.mockResolvedValue({
      accountStatus: "active",
      deactivatedAt: null,
      purgeAt: null,
    });
    authMocks.refreshSession.mockResolvedValue(undefined);
  });

  it("renderiza formulário de entrar", () => {
    renderLoginPage();

    expect(screen.getByRole("heading", { name: /bem-vindo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /acessar minha conta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar com google/i })).toBeInTheDocument();
  });

  it("envia credenciais no modo entrar", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), "test@example.com");
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: /acessar minha conta/i }));

    await waitFor(() => {
      expect(authMocks.signInWithEmail).toHaveBeenCalledWith("test@example.com", "senha123");
    });
  });

  it("cria conta no modo criar conta", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("radio", { name: /criar minha conta/i }));
    await user.type(screen.getByLabelText(/e-mail/i), "novo@example.com");
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: /^criar minha conta$/i }));

    await waitFor(() => {
      expect(authMocks.signUpWithEmail).toHaveBeenCalledWith("novo@example.com", "senha123");
    });
  });

  it("exibe erro em português quando login falha", async () => {
    authMocks.signInWithEmail.mockRejectedValueOnce({ code: "auth/wrong-password" });
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), "test@example.com");
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: /acessar minha conta/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/senha incorreta/i);
  });

  it("chama login com Google", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: /entrar com google/i }));

    await waitFor(() => {
      expect(authMocks.signInWithGoogle).toHaveBeenCalled();
    });
  });

  it("abre modal de reativação quando a conta está desativada", async () => {
    const user = userEvent.setup();
    renderLoginPage({ status: "deactivated", uid: "user-1" });

    expect(
      await screen.findByRole("alertdialog", { name: /conta desativada encontrada/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sim, reativar minha conta/i }));

    await waitFor(() => {
      expect(authMocks.reactivateUser).toHaveBeenCalledWith("user-1");
      expect(authMocks.refreshSession).toHaveBeenCalled();
    });
  });
});
