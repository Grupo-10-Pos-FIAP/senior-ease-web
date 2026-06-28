import { setupServer } from 'msw/node'
import { preferencesHandlers } from '@infrastructure/msw/handlers/preferences.handlers'
import { tasksHandlers } from '@infrastructure/msw/handlers/tasks.handlers'

export const server = setupServer(...preferencesHandlers, ...tasksHandlers)
