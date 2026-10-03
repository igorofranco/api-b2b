import { Controller, Get } from '@nestjs/common';
import { Public } from '../presentation/http/decorators/public.decorator.js';

export interface HealthResponse {
  status: 'ok';
  uptime: number;
  timestamp: string;
}

@Public()
@Controller('health')
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
