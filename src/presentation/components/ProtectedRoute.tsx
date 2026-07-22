import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@app/providers/authContext";
import { FirebaseSetupPage } from "@presentation/pages/FirebaseSetupPage";

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "configuration_error") {
    return <FirebaseSetupPage />;
  }

  if (status === "loading") {
    return <p style={{ padding: "2rem", textAlign: "center" }}>Carregando…</p>;
  }

  if (status === "unauthenticated" || status === "deactivated") {
    return <Navigate to="/entrar" replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { status } = useAuth();

  if (status === "configuration_error") {
    return <FirebaseSetupPage />;
  }

  if (status === "loading") {
    return <p style={{ padding: "2rem", textAlign: "center" }}>Carregando…</p>;
  }

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
