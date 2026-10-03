import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { StockReservationMapper } from '../mappers.js';
import type { StockReservation } from '../../../../domain/entities/stock-reservation.js';
import type { StockReservationRepository } from '../../../../domain/repositories/stock-reservation-repository.js';

@Injectable()
export class PrismaStockReservationRepository implements StockReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrderId(orderId: string): Promise<StockReservation[]> {
    const records = await this.prisma.stockReservation.findMany({
      where: { orderId },
    });
    return records.map((record) => StockReservationMapper.toDomain(record));
  }

  async createMany(reservations: readonly StockReservation[]): Promise<void> {
    if (reservations.length === 0) {
      return;
    }
    await this.prisma.stockReservation.createMany({
      data: reservations.map((reservation) =>
        StockReservationMapper.toRecord(reservation),
      ),
    });
  }

  async updateMany(reservations: readonly StockReservation[]): Promise<void> {
    for (const reservation of reservations) {
      await this.prisma.stockReservation.update({
        where: { id: reservation.id },
        data: { status: reservation.status },
      });
    }
  }
}
