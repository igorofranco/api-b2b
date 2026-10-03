import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  TokenPayload,
  TokenService,
} from '../../application/ports/token-service.js';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwt: JwtService) {}

  sign(payload: TokenPayload): Promise<string> {
    return this.jwt.signAsync(payload);
  }

  verify(token: string): Promise<TokenPayload> {
    return this.jwt.verifyAsync<TokenPayload>(token);
  }
}
