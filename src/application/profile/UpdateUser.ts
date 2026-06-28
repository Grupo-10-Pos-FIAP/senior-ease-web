import { createUser, type User } from '@domain/entities/User'
import type { IUserRepository, UserUpdateInput } from '@domain/repositories/IUserRepository'

export class UpdateUser {
  constructor(private readonly repository: IUserRepository) {}

  async execute(userId: string, input: UserUpdateInput): Promise<User> {
    const current = await this.repository.get(userId)

    const updated = createUser({
      id: current.id,
      fullName: input.fullName ?? current.fullName,
      birthDate: input.birthDate ?? current.birthDate,
      registrationId: input.registrationId ?? current.registrationId,
      disability: input.disability !== undefined ? input.disability : current.disability,
      email: input.email ?? current.email,
      phone: input.phone ?? current.phone,
    })

    return this.repository.update(userId, {
      fullName: updated.fullName,
      birthDate: updated.birthDate,
      registrationId: updated.registrationId,
      disability: updated.disability,
      email: updated.email,
      phone: updated.phone,
    })
  }
}
