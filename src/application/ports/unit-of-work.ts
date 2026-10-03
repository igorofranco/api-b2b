import type { StockReservation } from '../../domain/entities/stock-reservation.js';

export interface StockPlan {
  reservations: readonly StockReservation[];
  release(): void;
}

export interface UnitOfWork {
  run<T>(work: (outbox: StockReservation[]) => Promise<T>): Promise<T>;
}
