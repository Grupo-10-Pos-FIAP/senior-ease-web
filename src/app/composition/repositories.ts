import { httpClient } from '@app/composition/httpClient'
import { FallbackPreferencesRepository } from '@infrastructure/repositories/FallbackPreferencesRepository'
import { HttpPreferencesRepository } from '@infrastructure/repositories/HttpPreferencesRepository'
import { HttpTaskRepository } from '@infrastructure/repositories/HttpTaskRepository'
import { LocalStoragePreferencesRepository } from '@infrastructure/repositories/LocalStoragePreferencesRepository'

const httpRepository = new HttpPreferencesRepository(httpClient)
const localRepository = new LocalStoragePreferencesRepository()

export const preferencesRepository = new FallbackPreferencesRepository(
  httpRepository,
  localRepository,
)

export const taskRepository = new HttpTaskRepository(httpClient)
