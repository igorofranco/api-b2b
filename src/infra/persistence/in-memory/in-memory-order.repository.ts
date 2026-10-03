import type { Order } from '../../../domain/entities/order.js';
import type { OrderRepository } from '../../../domain/repositories/order-repository.js';

const OPEN_STATUSES = new Set(['PENDING_APPROVAL']);

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async findByIdempotencyKey(
    customerId: string,
    idempotencyKey: string,
  ): Promise<Order | null> {
    for (const order of this.orders.values()) {
      if (
        order.customerId === customerId &&
        order.idempotencyKey.value === idempotencyKey
      ) {
        return order;
      }
    }
    return null;
  }

  async findOpenByCustomer(customerId: string): Promise<Order[]> {
    return [...this.orders.values()].filter(
      (order) =>
        order.customerId === customerId && OPEN_STATUSES.has(order.status),
    );
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }
}
