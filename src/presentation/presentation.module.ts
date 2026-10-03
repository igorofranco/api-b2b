import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApplicationModule } from '../application/application.module.js';
import { AuthController } from './http/controllers/auth.controller.js';
import { CustomersController } from './http/controllers/customers.controller.js';
import { PriceTablesController } from './http/controllers/price-tables.controller.js';
import { ProductsController } from './http/controllers/products.controller.js';
import { JwtAuthGuard } from './http/guards/jwt-auth.guard.js';
import { RolesGuard } from './http/guards/roles.guard.js';

@Module({
  imports: [ApplicationModule],
  controllers: [
    AuthController,
    CustomersController,
    ProductsController,
    PriceTablesController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class PresentationModule {}
