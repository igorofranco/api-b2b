import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { StockMapper, StockReservationMapper } from './mappers.js';
import type { Stock } from '../../../domain/entities/stock.js';
import type { StockReservation } from '../../../domain/entities/stock-reservation.js';
import type {
  StockLock,
  StockLockOperations,
} from '../../../application/ports/stock-lock.js';

@Injectable()
export class PrismaStockLock implements StockLock {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(
    work: (operations: StockLockOperations) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(
      async (transaction) => {
        const operations: StockLockOperations = {
          acquire: async (productIds) => {
            if (productIds.length === 0) {
              return new Map();
            }
            await transaction.$queryRaw`
              SELECT id FROM stocks WHERE product_id = ANY(${productIds}) FOR UPDATE
            `;
            const records = await transaction.stock.findMany({
              where: { productId: { in: [...productIds] } },
            });
            return new Map(
              records.map((record) => [
                record.productId,
                StockMapper.toDomain(record),
              ]),
            );
          },
          saveStocks: async (stocks: readonly Stock[]) => {
            for (const stock of stocks) {
              await transaction.stock.update({
                where: { productId: stock.productId },
                data: {
                  quantityOnHand: stock.quantityOnHand,
                  quantityReserved: stock.quantityReserved,
                },
              });
            }
          },
          saveReservations: async (
            reservations: readonly StockReservation[],
          ) => {
            if (reservations.length === 0) {
              return;
            }
            await transaction.stockReservation.createMany({
              data: reservations.map((reservation) =>
                StockReservationMapper.toRecord(reservation),
              ),
            });
          },
        };

        return work(operations);
      },
      { timeout: 20000 },
    );
  }
}
