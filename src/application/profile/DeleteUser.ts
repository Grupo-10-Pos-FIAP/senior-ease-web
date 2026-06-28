import type { IUserRepository } from '@domain/repositories/IUserRepository'

export class DeleteUser {
  constructor(private readonly repository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    return this.repository.delete(userId)
  }
}
