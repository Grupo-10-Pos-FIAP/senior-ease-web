import type { User } from "@domain/entities/User";
import { UserNotFoundError } from "@domain/errors/UserNotFoundError";
import type { IUserRepository, UserUpdateInput } from "@domain/repositories/IUserRepository";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { HttpError } from "@infrastructure/api/HttpClient";
import { fromUserDto, toUserDto, type UserDto } from "@infrastructure/mappers/user.mapper";

export class HttpUserRepository implements IUserRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async get(userId: string): Promise<User> {
    try {
      const dto = await this.httpClient.get<UserDto>(`/api/users/${userId}`);
      return fromUserDto(dto);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        throw new UserNotFoundError(userId);
      }
      throw error;
    }
  }

  async update(userId: string, input: UserUpdateInput): Promise<User> {
    try {
      const dto = await this.httpClient.patch<UserDto>(`/api/users/${userId}`, input);
      return fromUserDto(dto);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        throw new UserNotFoundError(userId);
      }
      throw error;
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/api/users/${userId}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        throw new UserNotFoundError(userId);
      }
      throw error;
    }
  }
}

export { toUserDto };
