import { setupWorker } from 'msw/browser'
import { preferencesHandlers } from '@infrastructure/msw/handlers/preferences.handlers'
import { tasksHandlers } from '@infrastructure/msw/handlers/tasks.handlers'
import { userHandlers } from '@infrastructure/msw/handlers/user.handlers'

export const worker = setupWorker(...preferencesHandlers, ...tasksHandlers, ...userHandlers)

export async function startMswWorker(): Promise<void> {
  await worker.start({ onUnhandledRequest: 'bypass' })
}
