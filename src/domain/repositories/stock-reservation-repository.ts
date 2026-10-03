import type { StockReservation } from '../entities/stock-reservation.js';

export const STOCK_RESERVATION_REPOSITORY = Symbol(
  'STOCK_RESERVATION_REPOSITORY',
);

export interface StockReservationRepository {
  findByOrderId(orderId: string): Promise<StockReservation[]>;
  createMany(reservations: readonly StockReservation[]): Promise<void>;
  updateMany(reservations: readonly StockReservation[]): Promise<void>;
}
