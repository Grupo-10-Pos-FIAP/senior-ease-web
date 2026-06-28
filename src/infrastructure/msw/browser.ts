import { setupWorker } from "msw/browser";
import { preferencesHandlers } from "@infrastructure/msw/handlers/preferences.handlers";

export const worker = setupWorker(...preferencesHandlers);

export async function startMswWorker(): Promise<void> {
  await worker.start({ onUnhandledRequest: "bypass" });
}
