import type { UserRole } from '../../domain/entities/user.js';

export interface AuthUserOutput {
  id: string;
  email: string;
  role: UserRole;
  customerId: string | null;
}

export interface LoginOutput {
  accessToken: string;
  user: AuthUserOutput;
}
