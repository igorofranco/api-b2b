import { Module } from '@nestjs/common';
import { ApplicationModule } from './application/application.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [ApplicationModule, HealthModule],
})
export class AppModule {}
