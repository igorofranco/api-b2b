import type { StockReservation } from '../../../domain/entities/stock-reservation.js';
import type { StockReservationRepository } from '../../../domain/repositories/stock-reservation-repository.js';

export class InMemoryStockReservationRepository implements StockReservationRepository {
  private readonly reservations = new Map<string, StockReservation>();

  async findByOrderId(orderId: string): Promise<StockReservation[]> {
    return [...this.reservations.values()].filter(
      (reservation) => reservation.orderId === orderId,
    );
  }

  async createMany(reservations: readonly StockReservation[]): Promise<void> {
    for (const reservation of reservations) {
      this.reservations.set(reservation.id, reservation);
    }
  }

  async updateMany(reservations: readonly StockReservation[]): Promise<void> {
    for (const reservation of reservations) {
      this.reservations.set(reservation.id, reservation);
    }
  }
}
