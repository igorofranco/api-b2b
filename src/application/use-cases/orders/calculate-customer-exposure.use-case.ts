import { Inject, Injectable } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../../domain/repositories/customer-repository.js';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../../domain/repositories/order-repository.js';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../domain/repositories/product-repository.js';
import { CreditPolicy } from '../../../domain/services/credit-policy.js';
import { Money } from '../../../domain/value-objects/money.js';
import { NotFoundError } from '../../errors/application-errors.js';
import type { OrderOutput } from '../../dtos/order-output.js';

export interface CustomerExposureOutput {
  customerId: string;
  creditLimitCents: number;
  exposureCents: number;
  availableCreditCents: number;
  openOrders: OrderOutput[];
}

@Injectable()
export class CalculateCustomerExposureUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(customerId: string): Promise<CustomerExposureOutput> {
    const customer = await this.customers.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Cliente', customerId);
    }

    const openOrders = await this.orders.findOpenByCustomer(customerId);
    const exposure = openOrders.reduce(
      (sum, order) => sum.plus(order.total),
      Money.fromCents(0),
    );

    const productIds = [
      ...new Set(
        openOrders.flatMap((order) =>
          order.items.map((item) => item.productId),
        ),
      ),
    ];
    const products = await this.products.findByIds(productIds);
    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    return {
      customerId,
      creditLimitCents: customer.creditLimit.cents,
      exposureCents: exposure.cents,
      availableCreditCents: CreditPolicy.availableCredit(
        exposure,
        customer.creditLimit,
      ).cents,
      openOrders: openOrders.map((order) => ({
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
      })),
    };
  }
}
