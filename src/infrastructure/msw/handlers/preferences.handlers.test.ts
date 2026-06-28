import { describe, expect, it } from 'vitest'
import { HttpClient } from '@infrastructure/api/HttpClient'
import { HttpPreferencesRepository } from '@infrastructure/repositories/HttpPreferencesRepository'

describe('preferences MSW handlers', () => {
  it('GET e PUT /api/users/:id/preferences', async () => {
    const repo = new HttpPreferencesRepository(new HttpClient())
    const initial = await repo.get('demo-user')

    expect(initial.fontSize).toBe(3)

    const updated = await repo.update('demo-user', {
      ...initial,
      fontSize: 5,
    })

    expect(updated.fontSize).toBe(5)

    const fetched = await repo.get('demo-user')
    expect(fetched.fontSize).toBe(5)
  })
})
