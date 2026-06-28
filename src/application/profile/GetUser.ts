import type { User } from '@domain/entities/User'
import type { IUserRepository } from '@domain/repositories/IUserRepository'

export class GetUser {
  constructor(private readonly repository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    return this.repository.get(userId)
  }
}
