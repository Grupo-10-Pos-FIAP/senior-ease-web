import { createContext, useContext } from "react";
import type { AuthUser } from "@infrastructure/firebase/authService";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "configuration_error";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
