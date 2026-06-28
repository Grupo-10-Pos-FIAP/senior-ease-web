import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "@presentation/pages/LoginPage";

const authMocks = vi.hoisted(() => ({
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
}));

vi.mock("@infrastructure/firebase/authService", () => ({
  signInWithEmail: authMocks.signInWithEmail,
  signUpWithEmail: authMocks.signUpWithEmail,
  signInWithGoogle: authMocks.signInWithGoogle,
}));

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    authMocks.signInWithEmail.mockReset();
    authMocks.signUpWithEmail.mockReset();
    authMocks.signInWithGoogle.mockReset();
    authMocks.signInWithEmail.mockResolvedValue({ uid: "user-1", email: "test@example.com" });
    authMocks.signUpWithEmail.mockResolvedValue({ uid: "user-1", email: "test@example.com" });
    authMocks.signInWithGoogle.mockResolvedValue({ uid: "user-1", email: "test@example.com" });
  });

  it("renderiza formulário de entrar", () => {
    renderLoginPage();

    expect(screen.getByRole("heading", { name: /bem-vindo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^entrar$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar com google/i })).toBeInTheDocument();
  });

  it("envia credenciais no modo entrar", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), "test@example.com");
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: /^entrar$/i }));

    await waitFor(() => {
      expect(authMocks.signInWithEmail).toHaveBeenCalledWith("test@example.com", "senha123");
    });
  });

  it("cria conta no modo criar conta", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("radio", { name: /criar conta/i }));
    await user.type(screen.getByLabelText(/e-mail/i), "novo@example.com");
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: /criar minha conta/i }));

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
    await user.click(screen.getByRole("button", { name: /^entrar$/i }));

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
});
