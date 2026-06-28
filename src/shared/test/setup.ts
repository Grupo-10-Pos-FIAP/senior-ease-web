import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '@infrastructure/msw/server'
import { resetPreferencesDb } from '@infrastructure/msw/db/preferences.db'

beforeAll(() => server.listen())
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetPreferencesDb()
  localStorage.clear()
  delete document.documentElement.dataset.interfaceMode
  delete document.documentElement.dataset.reinforcedFeedback
  delete document.documentElement.dataset.contrastLevel
})
afterAll(() => server.close())
