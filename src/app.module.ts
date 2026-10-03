import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { PresentationModule } from './presentation/presentation.module.js';

@Module({
  imports: [PresentationModule, HealthModule],
})
export class AppModule {}
