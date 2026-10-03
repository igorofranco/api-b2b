import { Inject, Injectable } from '@nestjs/common';
import { Order, OrderItem } from '../../../domain/entities/order.js';
import { StockReservation } from '../../../domain/entities/stock-reservation.js';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../../domain/repositories/customer-repository.js';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../../domain/repositories/order-repository.js';
import {
  PRICE_TABLE_REPOSITORY,
  type PriceTableRepository,
} from '../../../domain/repositories/price-table-repository.js';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../domain/repositories/product-repository.js';
import { CreditPolicy } from '../../../domain/services/credit-policy.js';
import { IdempotencyKey } from '../../../domain/value-objects/idempotency-key.js';
import { Money } from '../../../domain/value-objects/money.js';
import { Quantity } from '../../../domain/value-objects/quantity.js';
import {
  CustomerInactiveError,
  DuplicateItemError,
  NotFoundError,
  ProductInactiveError,
} from '../../errors/application-errors.js';
import { ID_GENERATOR, type IdGenerator } from '../../ports/id-generator.js';
import { STOCK_LOCK, type StockLock } from '../../ports/stock-lock.js';
import type { OrderOutput } from '../../dtos/order-output.js';

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerId: string;
  idempotencyKey: string;
  items: CreateOrderItemInput[];
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(PRICE_TABLE_REPOSITORY)
    private readonly priceTables: PriceTableRepository,
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(STOCK_LOCK) private readonly stockLock: StockLock,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute(input: CreateOrderInput): Promise<OrderOutput> {
    const idempotencyKey = IdempotencyKey.create(input.idempotencyKey);

    const existing = await this.orders.findByIdempotencyKey(
      input.customerId,
      idempotencyKey.value,
    );
    if (existing) {
      return this.toOutput(existing);
    }

    const customer = await this.customers.findById(input.customerId);
    if (!customer) {
      throw new NotFoundError('Cliente', input.customerId);
    }
    if (!customer.isActive()) {
      throw new CustomerInactiveError();
    }
    if (input.items.length === 0) {
      throw new NotFoundError('Itens do pedido', 'vazio');
    }

    const productIds = input.items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new DuplicateItemError(
        productIds.find((id, index) => productIds.indexOf(id) !== index) ?? '',
      );
    }

    const products = await this.products.findByIds(productIds);
    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    const priceTable = await this.priceTables.findById(customer.priceTableId);
    if (!priceTable) {
      throw new NotFoundError('Tabela de preço', customer.priceTableId);
    }

    let total = Money.fromCents(0);
    const orderItems: OrderItem[] = [];

    for (const item of input.items) {
      const product = productById.get(item.productId);
      if (!product) {
        throw new NotFoundError('Produto', item.productId);
      }
      if (!product.isActive()) {
        throw new ProductInactiveError(product.id);
      }

      const quantity = Quantity.create(item.quantity);
      const unitPrice = priceTable.priceFor(product.id) ?? product.basePrice;
      const orderItem = OrderItem.create({
        id: this.ids.generate(),
        productId: product.id,
        quantity,
        unitPrice,
      });

      total = total.plus(orderItem.subtotal);
      orderItems.push(orderItem);
    }

    const openOrders = await this.orders.findOpenByCustomer(customer.id);
    const exposure = openOrders.reduce(
      (sum, order) => sum.plus(order.total),
      Money.fromCents(0),
    );
    const withinCredit = CreditPolicy.canConfirmDirectly(
      total,
      exposure,
      customer.creditLimit,
    );

    const order = Order.createConfirmation({
      id: this.ids.generate(),
      customerId: customer.id,
      idempotencyKey,
      items: orderItems,
      total,
      status: withinCredit ? 'CONFIRMED' : 'PENDING_APPROVAL',
    });

    if (withinCredit) {
      const now = new Date();
      const reservations = orderItems.map((item) =>
        StockReservation.create({
          id: this.ids.generate(),
          orderId: order.id,
          productId: item.productId,
          customerId: customer.id,
          quantity: item.quantity,
          createdAt: now,
        }),
      );

      await this.stockLock.run(async (operations) => {
        const stocks = await operations.acquire(
          orderItems.map((item) => item.productId),
        );

        for (const item of orderItems) {
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

      return this.toOutput(order);
    }

    await this.orders.save(order);
    return this.toOutput(order);
  }

  private toOutput(order: Order): OrderOutput {
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      totalCents: order.total.cents,
      idempotencyKey: order.idempotencyKey.value,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        sku: '',
        productName: '',
        quantity: item.quantity.value,
        unitPriceCents: item.unitPrice.cents,
        subtotalCents: item.subtotal.cents,
      })),
      createdAt: order.createdAt.toISOString(),
    };
  }
}
