import { DomainError } from '../errors/domain-error.js';
import { Email } from '../value-objects/email.js';

export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface UserCreateProps {
  id: string;
  email: Email;
  passwordHash: string;
  role: UserRole;
  customerId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private constructor(
    readonly id: string,
    readonly email: Email,
    private _passwordHash: string,
    readonly role: UserRole,
    readonly customerId: string | null,
    readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: UserCreateProps): User {
    if (props.passwordHash.trim().length === 0) {
      throw new DomainError(
        'O usuário precisa de uma senha.',
        'INVALID_PASSWORD_HASH',
      );
    }

    const customerId = props.customerId?.trim() || null;

    if (props.role === 'CUSTOMER' && customerId === null) {
      throw new DomainError(
        'O usuário cliente precisa estar vinculado a um cliente.',
        'MISSING_CUSTOMER_LINK',
      );
    }

    if (props.role === 'ADMIN' && customerId !== null) {
      throw new DomainError(
        'O usuário admin não pode estar vinculado a um cliente.',
        'INVALID_CUSTOMER_LINK',
      );
    }

    const now = new Date();
    return new User(
      props.id,
      props.email,
      props.passwordHash,
      props.role,
      customerId,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  changePasswordHash(passwordHash: string): void {
    if (passwordHash.trim().length === 0) {
      throw new DomainError(
        'O usuário precisa de uma senha.',
        'INVALID_PASSWORD_HASH',
      );
    }
    this._passwordHash = passwordHash;
    this._updatedAt = new Date();
  }
}
