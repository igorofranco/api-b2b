import type { Stock } from '../../../domain/entities/stock.js';
import type { StockReservation } from '../../../domain/entities/stock-reservation.js';
import type { StockRepository } from '../../../domain/repositories/stock-repository.js';
import type { StockReservationRepository } from '../../../domain/repositories/stock-reservation-repository.js';
import type {
  StockLock,
  StockLockOperations,
} from '../../../application/ports/stock-lock.js';

export class InMemoryStockLock implements StockLock {
  constructor(
    private readonly stocks: StockRepository,
    private readonly reservations: StockReservationRepository,
  ) {}

  async run<T>(
    work: (operations: StockLockOperations) => Promise<T>,
  ): Promise<T> {
    const operations: StockLockOperations = {
      acquire: async (productIds: readonly string[]) => {
        const stocks = await this.stocks.findByProductIds(productIds);
        return new Map(stocks.map((stock) => [stock.productId, stock]));
      },
      saveStocks: async (stocks: readonly Stock[]) => {
        for (const stock of stocks) {
          await this.stocks.save(stock);
        }
      },
      saveReservations: async (reservations: readonly StockReservation[]) => {
        await this.reservations.createMany(
          reservations.filter((reservation) => reservation.isActive()),
        );
        const released = reservations.filter(
          (reservation) => !reservation.isActive(),
        );
        if (released.length > 0) {
          await this.reservations.updateMany(released);
        }
      },
    };

    return work(operations);
  }
}
