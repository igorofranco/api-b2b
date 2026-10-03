import { Inject, Injectable } from '@nestjs/common';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../../domain/repositories/order-repository.js';
import {
  STOCK_RESERVATION_REPOSITORY,
  type StockReservationRepository,
} from '../../../domain/repositories/stock-reservation-repository.js';
import { STOCK_LOCK, type StockLock } from '../../ports/stock-lock.js';
import {
  NotFoundError,
  OrderNotCancellableError,
} from '../../errors/application-errors.js';

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(STOCK_RESERVATION_REPOSITORY)
    private readonly reservations: StockReservationRepository,
    @Inject(STOCK_LOCK) private readonly stockLock: StockLock,
  ) {}

  async execute(orderId: string): Promise<string> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      throw new NotFoundError('Pedido', orderId);
    }
    if (!order.isConfirmed()) {
      throw new OrderNotCancellableError(orderId);
    }

    const reservations = (
      await this.reservations.findByOrderId(orderId)
    ).filter((reservation) => reservation.isActive());

    order.cancel();

    await this.stockLock.run(async (operations) => {
      const stocks = await operations.acquire(
        reservations.map((reservation) => reservation.productId),
      );

      for (const reservation of reservations) {
        const stock = stocks.get(reservation.productId);
        if (stock) {
          stock.release(reservation.quantity);
        }
        reservation.release();
      }

      await operations.saveStocks([...stocks.values()]);
      await this.orders.save(order);
      await operations.saveReservations(reservations);
    });

    return order.status;
  }
}
