import { createContext, useContext } from "react";
import type { AuthUser } from "@infrastructure/firebase/authService";

export type AuthStatus =
  "loading" | "authenticated" | "unauthenticated" | "deactivated" | "configuration_error";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  /** Reavalia o ciclo de vida da conta (ex.: após reativação). */
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
