import { Outlet } from "react-router-dom";
import { AppHeader } from "@shared/ui";
import "./AppLayout.css";

export function AppLayout() {
  return (
    <div className="app-layout">
      <AppHeader />
      <main className="app-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
