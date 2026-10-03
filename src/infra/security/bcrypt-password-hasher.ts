import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../application/ports/password-hasher.js';

const SALT_ROUNDS = 12;

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
