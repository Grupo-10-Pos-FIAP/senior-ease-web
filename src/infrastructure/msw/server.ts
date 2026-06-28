import { setupServer } from 'msw/node'
import { preferencesHandlers } from '@infrastructure/msw/handlers/preferences.handlers'

export const server = setupServer(...preferencesHandlers)
