import type { Stock } from '../../domain/entities/stock.js';
import type { StockReservation } from '../../domain/entities/stock-reservation.js';

export interface StockLockOperations {
  acquire(productIds: readonly string[]): Promise<Map<string, Stock>>;
  saveStocks(stocks: readonly Stock[]): Promise<void>;
  saveReservations(reservations: readonly StockReservation[]): Promise<void>;
}

export interface StockLock {
  run<T>(work: (operations: StockLockOperations) => Promise<T>): Promise<T>;
}

export const STOCK_LOCK = Symbol('STOCK_LOCK');
