import { Module } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '../domain/repositories/customer-repository.js';
import { ORDER_REPOSITORY } from '../domain/repositories/order-repository.js';
import { PRICE_TABLE_REPOSITORY } from '../domain/repositories/price-table-repository.js';
import { PRODUCT_REPOSITORY } from '../domain/repositories/product-repository.js';
import { STOCK_REPOSITORY } from '../domain/repositories/stock-repository.js';
import { STOCK_RESERVATION_REPOSITORY } from '../domain/repositories/stock-reservation-repository.js';
import { STOCK_LOCK } from '../application/ports/stock-lock.js';
import { ID_GENERATOR } from '../application/ports/id-generator.js';
import { PrismaService } from './persistence/prisma/prisma.service.js';
import { PrismaCustomerRepository } from './persistence/prisma/repositories/prisma-customer.repository.js';
import { PrismaProductRepository } from './persistence/prisma/repositories/prisma-product.repository.js';
import { PrismaPriceTableRepository } from './persistence/prisma/repositories/prisma-price-table.repository.js';
import { PrismaOrderRepository } from './persistence/prisma/repositories/prisma-order.repository.js';
import { PrismaStockRepository } from './persistence/prisma/repositories/prisma-stock.repository.js';
import { PrismaStockReservationRepository } from './persistence/prisma/repositories/prisma-stock-reservation.repository.js';
import { PrismaStockLock } from './persistence/prisma/prisma-stock-lock.js';
import { CryptoIdGenerator } from './id/crypto-id-generator.js';

@Module({
  providers: [
    PrismaService,
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    { provide: PRICE_TABLE_REPOSITORY, useClass: PrismaPriceTableRepository },
    { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
    { provide: STOCK_REPOSITORY, useClass: PrismaStockRepository },
    {
      provide: STOCK_RESERVATION_REPOSITORY,
      useClass: PrismaStockReservationRepository,
    },
    { provide: STOCK_LOCK, useClass: PrismaStockLock },
    { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  ],
  exports: [
    PrismaService,
    CUSTOMER_REPOSITORY,
    PRODUCT_REPOSITORY,
    PRICE_TABLE_REPOSITORY,
    ORDER_REPOSITORY,
    STOCK_REPOSITORY,
    STOCK_RESERVATION_REPOSITORY,
    STOCK_LOCK,
    ID_GENERATOR,
  ],
})
export class PersistenceModule {}
