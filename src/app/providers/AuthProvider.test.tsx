import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "@app/providers/AuthProvider";
import { useAuth } from "@app/providers/authContext";
import type { AuthUser } from "@infrastructure/firebase/authService";

const authMocks = vi.hoisted(() => ({
  subscribeToAuthState: vi.fn(),
  ensureUserDocument: vi.fn(),
  isFirebaseConfigured: vi.fn(() => true),
  signOutUser: vi.fn(),
  getAccountLifecycle: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock("@infrastructure/firebase/client", () => ({
  isFirebaseConfigured: authMocks.isFirebaseConfigured,
}));

vi.mock("@infrastructure/firebase/authService", () => ({
  subscribeToAuthState: authMocks.subscribeToAuthState,
  signOutUser: authMocks.signOutUser,
}));

vi.mock("@infrastructure/firebase/seedUserData", () => ({
  ensureUserDocument: authMocks.ensureUserDocument,
}));

vi.mock("@app/composition/useCases", () => ({
  getAccountLifecycle: { execute: authMocks.getAccountLifecycle },
  deleteUser: { execute: authMocks.deleteUser },
}));

function AuthStatusProbe() {
  const { status } = useAuth();
  return <p>status:{status}</p>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    authMocks.subscribeToAuthState.mockReset();
    authMocks.ensureUserDocument.mockReset();
    authMocks.signOutUser.mockReset();
    authMocks.getAccountLifecycle.mockReset();
    authMocks.deleteUser.mockReset();
    authMocks.isFirebaseConfigured.mockReturnValue(true);
    authMocks.ensureUserDocument.mockResolvedValue(undefined);
    authMocks.getAccountLifecycle.mockResolvedValue({
      accountStatus: "active",
      deactivatedAt: null,
      purgeAt: null,
    });
  });

  it("mantém usuário autenticado mesmo se o seed do Firestore falhar", async () => {
    authMocks.ensureUserDocument.mockRejectedValue(new Error("permission-denied"));
    authMocks.subscribeToAuthState.mockImplementation(
      (callback: (user: AuthUser | null) => void) => {
        callback({ uid: "user-1", email: "test@example.com" });
        return () => undefined;
      },
    );

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("status:authenticated")).toBeInTheDocument();
    });

    expect(authMocks.ensureUserDocument).toHaveBeenCalledWith("user-1", "test@example.com");
  });

  it("marca status deactivated quando a conta está desativada", async () => {
    authMocks.getAccountLifecycle.mockResolvedValue({
      accountStatus: "deactivated",
      deactivatedAt: "2026-07-01T00:00:00.000Z",
      purgeAt: "2026-10-01T00:00:00.000Z",
    });
    authMocks.subscribeToAuthState.mockImplementation(
      (callback: (user: AuthUser | null) => void) => {
        callback({ uid: "user-1", email: "test@example.com" });
        return () => undefined;
      },
    );

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("status:deactivated")).toBeInTheDocument();
    });
  });

  it("só autentica depois que o seed do catálogo termina", async () => {
    let resolveSeed: (() => void) | undefined;
    authMocks.ensureUserDocument.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSeed = resolve;
        }),
    );
    authMocks.subscribeToAuthState.mockImplementation(
      (callback: (user: AuthUser | null) => void) => {
        callback({ uid: "user-1", email: "test@example.com" });
        return () => undefined;
      },
    );

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("status:loading")).toBeInTheDocument();
    });

    resolveSeed?.();

    await waitFor(() => {
      expect(screen.getByText("status:authenticated")).toBeInTheDocument();
    });
  });
});
