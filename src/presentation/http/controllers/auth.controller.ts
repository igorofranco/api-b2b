import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../../../application/ports/token-service.js';
import { AuthenticateUserUseCase } from '../../../application/use-cases/auth/authenticate-user.use-case.js';
import { GetCurrentUserUseCase } from '../../../application/use-cases/auth/get-current-user.use-case.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import { LoginDto } from '../dtos/login.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticate: AuthenticateUserUseCase,
    private readonly currentUser: GetCurrentUserUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authenticate.execute(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.currentUser.execute(user.userId);
  }
}
