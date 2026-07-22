import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { deleteUser, getAccountLifecycle } from "@app/composition/useCases";
import { AuthContext, type AuthStatus } from "@app/providers/authContext";
import { isAccountDeactivated, isAccountPurgeDue } from "@domain/accountLifecycle";
import { isFirebaseConfigured } from "@infrastructure/firebase/client";
import {
  signOutUser,
  subscribeToAuthState,
  type AuthUser,
} from "@infrastructure/firebase/authService";
import { ensureUserDocument } from "@infrastructure/firebase/seedUserData";

interface AuthProviderProps {
  children: ReactNode;
}

async function resolveStatusForUser(authUser: AuthUser): Promise<AuthStatus> {
  try {
    const lifecycle = await getAccountLifecycle.execute(authUser.uid);

    if (isAccountPurgeDue(lifecycle)) {
      try {
        await deleteUser.execute(authUser.uid);
      } catch (error: unknown) {
        console.error("[SeniorEase] Falha ao excluir conta vencida:", error);
      }
      await signOutUser();
      return "unauthenticated";
    }

    if (isAccountDeactivated(lifecycle)) {
      return "deactivated";
    }

    return "authenticated";
  } catch (error: unknown) {
    console.error("[SeniorEase] Falha ao ler ciclo de vida da conta:", error);
    return "authenticated";
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    isFirebaseConfigured() ? "loading" : "configuration_error",
  );
  const requestIdRef = useRef(0);

  const applyAuthUser = useCallback(async (authUser: AuthUser, requestId: number) => {
    setUser(authUser);
    setStatus("loading");

    try {
      await ensureUserDocument(authUser.uid, authUser.email);
    } catch (error: unknown) {
      console.error("[SeniorEase] Falha ao preparar dados do usuário no Firestore:", error);
    }

    if (requestId !== requestIdRef.current) {
      return;
    }

    const nextStatus = await resolveStatusForUser(authUser);

    if (requestId !== requestIdRef.current) {
      return;
    }

    if (nextStatus === "unauthenticated") {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    setStatus(nextStatus);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    return subscribeToAuthState((authUser) => {
      const requestId = ++requestIdRef.current;

      if (!authUser) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      void applyAuthUser(authUser, requestId);
    });
  }, [applyAuthUser]);

  const refreshSession = useCallback(async () => {
    const current = user;
    if (!current) {
      setStatus("unauthenticated");
      return;
    }

    const requestId = ++requestIdRef.current;
    setStatus("loading");
    const nextStatus = await resolveStatusForUser(current);

    if (requestId !== requestIdRef.current) {
      return;
    }

    if (nextStatus === "unauthenticated") {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    setStatus(nextStatus);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      status,
      refreshSession,
    }),
    [user, status, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
