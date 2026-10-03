import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type {
  AuthenticatedUser,
  TokenPayload,
} from '../../application/ports/token-service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me',
    });
  }

  validate(payload: TokenPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      role: payload.role,
      customerId: payload.customerId,
    };
  }
}
