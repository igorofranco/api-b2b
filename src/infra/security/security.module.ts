import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PASSWORD_HASHER } from '../../application/ports/password-hasher.js';
import { TOKEN_SERVICE } from '../../application/ports/token-service.js';
import { BcryptPasswordHasher } from './bcrypt-password-hasher.js';
import { JwtTokenService } from './jwt-token.service.js';
import { JwtStrategy } from './jwt.strategy.js';

const expiresIn = (process.env.JWT_EXPIRES_IN ?? '1h') as NonNullable<
  JwtSignOptions['expiresIn']
>;

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me',
      signOptions: { expiresIn },
    }),
  ],
  providers: [
    JwtStrategy,
    BcryptPasswordHasher,
    { provide: PASSWORD_HASHER, useExisting: BcryptPasswordHasher },
    JwtTokenService,
    { provide: TOKEN_SERVICE, useExisting: JwtTokenService },
  ],
  exports: [PASSWORD_HASHER, TOKEN_SERVICE, PassportModule, JwtModule],
})
export class SecurityModule {}
