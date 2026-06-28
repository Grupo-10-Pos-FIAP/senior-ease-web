import { setupWorker } from 'msw/browser'
import { preferencesHandlers } from '@infrastructure/msw/handlers/preferences.handlers'
import { tasksHandlers } from '@infrastructure/msw/handlers/tasks.handlers'

export const worker = setupWorker(...preferencesHandlers, ...tasksHandlers)

export async function startMswWorker(): Promise<void> {
  await worker.start({ onUnhandledRequest: 'bypass' })
}
