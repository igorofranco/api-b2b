import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.js';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../../domain/repositories/order-repository.js';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../domain/repositories/product-repository.js';
import { NotFoundError } from '../../errors/application-errors.js';
import type { OrderOutput } from '../../dtos/order-output.js';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(orderId: string): Promise<OrderOutput> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      throw new NotFoundError('Pedido', orderId);
    }

    return this.decorate(order);
  }

  private async decorate(order: Order): Promise<OrderOutput> {
    const productIds = [...new Set(order.items.map((item) => item.productId))];
    const products = await this.products.findByIds(productIds);
    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      totalCents: order.total.cents,
      idempotencyKey: order.idempotencyKey.value,
      items: order.items.map((item) => {
        const product = productById.get(item.productId);
        return {
          id: item.id,
          productId: item.productId,
          sku: product?.sku.value ?? '',
          productName: product?.name ?? '',
          quantity: item.quantity.value,
          unitPriceCents: item.unitPrice.cents,
          subtotalCents: item.subtotal.cents,
        };
      }),
      createdAt: order.createdAt.toISOString(),
    };
  }
}
