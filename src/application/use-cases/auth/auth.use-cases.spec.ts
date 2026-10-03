import { describe, expect, it } from 'vitest';
import { User } from '../../../domain/entities/user.js';
import { InvalidCredentialsError } from '../../../domain/errors/invalid-credentials.error.js';
import { Email } from '../../../domain/value-objects/email.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { TokenPayload, TokenService } from '../../ports/token-service.js';
import { InMemoryRepositories } from '../../../infra/persistence/in-memory/in-memory-repositories.js';
import { AuthenticateUserUseCase } from './authenticate-user.use-case.js';
import { GetCurrentUserUseCase } from './get-current-user.use-case.js';

class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}

class FakeTokenService implements TokenService {
  async sign(payload: TokenPayload): Promise<string> {
    return `token:${payload.sub}:${payload.role}`;
  }

  async verify(token: string): Promise<TokenPayload> {
    const [, sub = '', role = 'CUSTOMER'] = token.split(':');
    return { sub, role: role as TokenPayload['role'], customerId: null };
  }
}

async function seedUsers() {
  const repositories = new InMemoryRepositories();
  await repositories.users.save(
    User.create({
      id: 'u1',
      email: Email.create('admin@api-b2b.dev'),
      passwordHash: 'hashed:admin123',
      role: 'ADMIN',
    }),
  );
  await repositories.users.save(
    User.create({
      id: 'u2',
      email: Email.create('compras@metalurgica.dev'),
      passwordHash: 'hashed:cliente123',
      role: 'CUSTOMER',
      customerId: 'c1',
    }),
  );
  return repositories;
}

describe('AuthenticateUserUseCase', () => {
  it('autentica e devolve token com o papel do usuário', async () => {
    const repositories = await seedUsers();
    const useCase = new AuthenticateUserUseCase(
      repositories.users,
      new FakePasswordHasher(),
      new FakeTokenService(),
    );

    const result = await useCase.execute({
      email: 'ADMIN@api-b2b.dev',
      password: 'admin123',
    });

    expect(result.accessToken).toBe('token:u1:ADMIN');
    expect(result.user).toMatchObject({ id: 'u1', role: 'ADMIN' });
  });

  it('rejeita senha inválida', async () => {
    const repositories = await seedUsers();
    const useCase = new AuthenticateUserUseCase(
      repositories.users,
      new FakePasswordHasher(),
      new FakeTokenService(),
    );

    await expect(
      useCase.execute({ email: 'admin@api-b2b.dev', password: 'errada' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('rejeita e-mail inexistente', async () => {
    const repositories = await seedUsers();
    const useCase = new AuthenticateUserUseCase(
      repositories.users,
      new FakePasswordHasher(),
      new FakeTokenService(),
    );

    await expect(
      useCase.execute({ email: 'naoexiste@api-b2b.dev', password: 'x' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});

describe('GetCurrentUserUseCase', () => {
  it('devolve o usuário pelo id', async () => {
    const repositories = await seedUsers();
    const useCase = new GetCurrentUserUseCase(repositories.users);

    const user = await useCase.execute('u2');
    expect(user).toMatchObject({
      id: 'u2',
      email: 'compras@metalurgica.dev',
      customerId: 'c1',
    });
  });

  it('lança erro para usuário inexistente', async () => {
    const repositories = await seedUsers();
    const useCase = new GetCurrentUserUseCase(repositories.users);

    await expect(useCase.execute('ghost')).rejects.toThrow();
  });
});
