import type { Order } from '../entities/order.js';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByIdempotencyKey(
    customerId: string,
    idempotencyKey: string,
  ): Promise<Order | null>;
  findOpenByCustomer(customerId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;
}
