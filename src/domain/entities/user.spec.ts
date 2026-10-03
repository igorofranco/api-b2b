import { describe, expect, it } from 'vitest';
import { User } from './user.js';
import { Email } from '../value-objects/email.js';

const baseProps = {
  id: 'u1',
  email: Email.create('Admin@API-b2b.dev'),
  passwordHash: 'hash',
  role: 'ADMIN' as const,
};

describe('User', () => {
  it('normaliza o e-mail em minúsculas', () => {
    const user = User.create(baseProps);
    expect(user.email.value).toBe('admin@api-b2b.dev');
  });

  it('exige cliente vinculado quando o papel é CUSTOMER', () => {
    expect(() => User.create({ ...baseProps, role: 'CUSTOMER' })).toThrow();
  });

  it('rejeita vínculo de cliente quando o papel é ADMIN', () => {
    expect(() =>
      User.create({ ...baseProps, role: 'ADMIN', customerId: 'c1' }),
    ).toThrow();
  });

  it('cria usuário cliente com vínculo', () => {
    const user = User.create({
      ...baseProps,
      role: 'CUSTOMER',
      customerId: 'c1',
    });
    expect(user.customerId).toBe('c1');
    expect(user.isAdmin()).toBe(false);
  });

  it('rejeita senha vazia', () => {
    expect(() => User.create({ ...baseProps, passwordHash: '  ' })).toThrow();
  });

  it('troca o hash da senha', () => {
    const user = User.create(baseProps);
    user.changePasswordHash('novo-hash');
    expect(user.passwordHash).toBe('novo-hash');
  });
});
