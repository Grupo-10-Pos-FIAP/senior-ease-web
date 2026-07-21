import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthStatus } from "@app/providers/authContext";
import { isFirebaseConfigured } from "@infrastructure/firebase/client";
import { subscribeToAuthState, type AuthUser } from "@infrastructure/firebase/authService";
import { ensureUserDocument } from "@infrastructure/firebase/seedUserData";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    isFirebaseConfigured() ? "loading" : "configuration_error",
  );

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    return subscribeToAuthState((authUser) => {
      if (!authUser) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      setUser(authUser);
      setStatus("loading");

      // Aguarda o sync do catálogo antes de liberar a app, para a lista de
      // atividades não carregar datas antigas do Firestore.
      void ensureUserDocument(authUser.uid, authUser.email)
        .catch((error: unknown) => {
          console.error("[SeniorEase] Falha ao preparar dados do usuário no Firestore:", error);
        })
        .finally(() => {
          setStatus("authenticated");
        });
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
    }),
    [user, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
