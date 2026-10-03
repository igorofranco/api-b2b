import { Inject, Injectable } from '@nestjs/common';
import { StockReservation } from '../../../domain/entities/stock-reservation.js';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../../domain/repositories/order-repository.js';
import {
  NotFoundError,
  OrderNotApprovableError,
} from '../../errors/application-errors.js';
import { ID_GENERATOR, type IdGenerator } from '../../ports/id-generator.js';
import { STOCK_LOCK, type StockLock } from '../../ports/stock-lock.js';

@Injectable()
export class ApproveOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(STOCK_LOCK) private readonly stockLock: StockLock,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute(orderId: string): Promise<string> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      throw new NotFoundError('Pedido', orderId);
    }
    if (!order.isPendingApproval()) {
      throw new OrderNotApprovableError(orderId);
    }

    order.approve();

    const now = new Date();
    const reservations = order.items.map((item) =>
      StockReservation.create({
        id: this.ids.generate(),
        orderId: order.id,
        productId: item.productId,
        customerId: order.customerId,
        quantity: item.quantity,
        createdAt: now,
      }),
    );

    await this.stockLock.run(async (operations) => {
      const stocks = await operations.acquire(
        order.items.map((item) => item.productId),
      );

      for (const item of order.items) {
        const stock = stocks.get(item.productId);
        if (!stock) {
          throw new NotFoundError('Estoque', item.productId);
        }
        stock.reserve(item.quantity);
      }

      await operations.saveStocks([...stocks.values()]);
      await this.orders.save(order);
      await operations.saveReservations(reservations);
    });

    return order.status;
  }
}

export function assertReservationsBelongToOrder(
  reservations: StockReservation[],
  orderId: string,
): void {
  for (const reservation of reservations) {
    if (reservation.orderId !== orderId) {
      throw new NotFoundError('Reserva', reservation.id);
    }
  }
}
