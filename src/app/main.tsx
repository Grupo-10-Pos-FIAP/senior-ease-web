import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryProvider } from "@app/providers/QueryProvider";
import { AccessibilityProvider } from "@app/providers/AccessibilityProvider";
import App from "./App";
import "./index.css";

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { startMswWorker } = await import("@infrastructure/msw/browser");
    await startMswWorker();
  }

  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element #root not found");
  }

  createRoot(root).render(
    <StrictMode>
      <QueryProvider>
        <AccessibilityProvider>
          <App />
        </AccessibilityProvider>
      </QueryProvider>
    </StrictMode>,
  );
}

void bootstrap();
