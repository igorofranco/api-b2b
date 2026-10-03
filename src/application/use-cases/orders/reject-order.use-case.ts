import { Inject, Injectable } from '@nestjs/common';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../../domain/repositories/order-repository.js';
import {
  NotFoundError,
  OrderNotApprovableError,
} from '../../errors/application-errors.js';

@Injectable()
export class RejectOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  async execute(orderId: string): Promise<string> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      throw new NotFoundError('Pedido', orderId);
    }
    if (!order.isPendingApproval()) {
      throw new OrderNotApprovableError(orderId);
    }

    order.reject();
    await this.orders.save(order);

    return order.status;
  }
}
