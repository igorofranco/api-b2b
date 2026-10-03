import { Customer } from '../../../domain/entities/customer.js';
import { Order, OrderItem } from '../../../domain/entities/order.js';
import {
  PriceTable,
  PriceTableItem,
} from '../../../domain/entities/price-table.js';
import { Product } from '../../../domain/entities/product.js';
import { Stock } from '../../../domain/entities/stock.js';
import { StockReservation } from '../../../domain/entities/stock-reservation.js';
import { Cnpj } from '../../../domain/value-objects/cnpj.js';
import { IdempotencyKey } from '../../../domain/value-objects/idempotency-key.js';
import { Money } from '../../../domain/value-objects/money.js';
import { Quantity } from '../../../domain/value-objects/quantity.js';
import { Sku } from '../../../domain/value-objects/sku.js';

export interface CustomerRecord {
  id: string;
  name: string;
  cnpj: string;
  status: 'ACTIVE' | 'INACTIVE';
  creditLimit: number;
  priceTableId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  basePrice: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceTableRecord {
  id: string;
  name: string;
  currency: string;
  validFrom: Date;
  validTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{ productId: string; price: number }>;
}

export interface StockRecord {
  id: string;
  productId: string;
  quantityOnHand: number;
  quantityReserved: number;
  updatedAt: Date;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderRecord {
  id: string;
  customerId: string;
  status: 'PENDING_APPROVAL' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  total: number;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemRecord[];
}

export interface StockReservationRecord {
  id: string;
  orderId: string;
  productId: string;
  customerId: string;
  quantity: number;
  status: 'ACTIVE' | 'RELEASED';
  createdAt: Date;
}

export const CustomerMapper = {
  toDomain(record: CustomerRecord): Customer {
    return Customer.create({
      id: record.id,
      name: record.name,
      cnpj: Cnpj.create(record.cnpj),
      creditLimit: Money.fromCents(record.creditLimit),
      priceTableId: record.priceTableId,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  },

  toRecord(customer: Customer): CustomerRecord {
    return {
      id: customer.id,
      name: customer.name,
      cnpj: customer.cnpj.value,
      status: customer.status,
      creditLimit: customer.creditLimit.cents,
      priceTableId: customer.priceTableId,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  },
};

export const ProductMapper = {
  toDomain(record: ProductRecord): Product {
    return Product.create({
      id: record.id,
      sku: Sku.create(record.sku),
      name: record.name,
      description: record.description,
      unit: record.unit,
      basePrice: Money.fromCents(record.basePrice),
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  },

  toRecord(product: Product): ProductRecord {
    return {
      id: product.id,
      sku: product.sku.value,
      name: product.name,
      description: product.description,
      unit: product.unit,
      basePrice: product.basePrice.cents,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  },
};

export const PriceTableMapper = {
  toDomain(record: PriceTableRecord): PriceTable {
    return PriceTable.create({
      id: record.id,
      name: record.name,
      currency: record.currency,
      validFrom: record.validFrom,
      validTo: record.validTo,
      items: record.items.map((item) =>
        PriceTableItem.create({
          productId: item.productId,
          price: Money.fromCents(item.price),
        }),
      ),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  },
};

export const StockMapper = {
  toDomain(record: StockRecord): Stock {
    return Stock.create({
      id: record.id,
      productId: record.productId,
      quantityOnHand: record.quantityOnHand,
      quantityReserved: record.quantityReserved,
      updatedAt: record.updatedAt,
    });
  },
};

export const OrderMapper = {
  toDomain(record: OrderRecord): Order {
    return Order.createConfirmation({
      id: record.id,
      customerId: record.customerId,
      idempotencyKey: IdempotencyKey.create(record.idempotencyKey),
      items: record.items.map((item) =>
        OrderItem.create({
          id: item.id,
          productId: item.productId,
          quantity: Quantity.create(item.quantity),
          unitPrice: Money.fromCents(item.unitPrice),
        }),
      ),
      total: Money.fromCents(record.total),
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  },
};

export const StockReservationMapper = {
  toDomain(record: StockReservationRecord): StockReservation {
    return StockReservation.create({
      id: record.id,
      orderId: record.orderId,
      productId: record.productId,
      customerId: record.customerId,
      quantity: Quantity.create(record.quantity),
      status: record.status,
      createdAt: record.createdAt,
    });
  },

  toRecord(reservation: StockReservation): StockReservationRecord {
    return {
      id: reservation.id,
      orderId: reservation.orderId,
      productId: reservation.productId,
      customerId: reservation.customerId,
      quantity: reservation.quantity.value,
      status: reservation.status,
      createdAt: reservation.createdAt,
    };
  },
};
