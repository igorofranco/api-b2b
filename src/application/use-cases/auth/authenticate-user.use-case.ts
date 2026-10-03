import { Inject, Injectable } from '@nestjs/common';
import { InvalidCredentialsError } from '../../../domain/errors/invalid-credentials.error.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user-repository.js';
import { Email } from '../../../domain/value-objects/email.js';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../ports/password-hasher.js';
import { TOKEN_SERVICE, type TokenService } from '../../ports/token-service.js';
import type { LoginOutput } from '../../dtos/auth-output.js';

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<LoginOutput> {
    const user = await this.users.findByEmail(Email.create(input.email));

    if (
      !user ||
      !(await this.hasher.compare(input.password, user.passwordHash))
    ) {
      throw new InvalidCredentialsError();
    }

    const accessToken = await this.tokens.sign({
      sub: user.id,
      role: user.role,
      customerId: user.customerId,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email.value,
        role: user.role,
        customerId: user.customerId,
      },
    };
  }
}
