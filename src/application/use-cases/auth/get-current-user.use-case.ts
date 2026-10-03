import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user-repository.js';
import { NotFoundError } from '../../errors/application-errors.js';
import type { AuthUserOutput } from '../../dtos/auth-output.js';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(userId: string): Promise<AuthUserOutput> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário', userId);
    }

    return {
      id: user.id,
      email: user.email.value,
      role: user.role,
      customerId: user.customerId,
    };
  }
}
