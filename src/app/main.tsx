import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryProvider } from "@app/providers/QueryProvider";
import { AuthProvider } from "@app/providers/AuthProvider";
import { AccessibilityProvider } from "@app/providers/AccessibilityProvider";
import App from "./App";
import "./index.css";

function bootstrap() {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element #root not found");
  }

  createRoot(root).render(
    <StrictMode>
      <QueryProvider>
        <AuthProvider>
          <AccessibilityProvider>
            <App />
          </AccessibilityProvider>
        </AuthProvider>
      </QueryProvider>
    </StrictMode>,
  );
}

bootstrap();
