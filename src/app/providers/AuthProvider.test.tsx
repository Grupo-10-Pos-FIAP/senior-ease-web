import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "@app/providers/AuthProvider";
import { useAuth } from "@app/providers/authContext";

const authMocks = vi.hoisted(() => ({
  subscribeToAuthState: vi.fn(),
  ensureUserDocument: vi.fn(),
  isFirebaseConfigured: vi.fn(() => true),
}));

vi.mock("@infrastructure/firebase/client", () => ({
  isFirebaseConfigured: authMocks.isFirebaseConfigured,
}));

vi.mock("@infrastructure/firebase/authService", () => ({
  subscribeToAuthState: authMocks.subscribeToAuthState,
}));

vi.mock("@infrastructure/firebase/seedUserData", () => ({
  ensureUserDocument: authMocks.ensureUserDocument,
}));

function AuthStatusProbe() {
  const { status } = useAuth();
  return <p>status:{status}</p>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    authMocks.subscribeToAuthState.mockReset();
    authMocks.ensureUserDocument.mockReset();
    authMocks.isFirebaseConfigured.mockReturnValue(true);
    authMocks.ensureUserDocument.mockRejectedValue(new Error("permission-denied"));
  });

  it("mantém usuário autenticado mesmo se o seed do Firestore falhar", async () => {
    authMocks.subscribeToAuthState.mockImplementation((callback) => {
      callback({ uid: "user-1", email: "test@example.com" });
      return () => undefined;
    });

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
});
