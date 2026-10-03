import type { UserRole } from '../../domain/entities/user.js';

export interface TokenPayload {
  sub: string;
  role: UserRole;
  customerId: string | null;
}

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  customerId: string | null;
}

export interface TokenService {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
