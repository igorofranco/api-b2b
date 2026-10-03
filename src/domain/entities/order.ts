import { DomainError } from '../errors/domain-error.js';
import { InvalidOrderItemsError } from '../errors/invalid-order-items.error.js';
import { IdempotencyKey } from '../value-objects/idempotency-key.js';
import { Money } from '../value-objects/money.js';
import { Quantity } from '../value-objects/quantity.js';

export type OrderStatus =
  'PENDING_APPROVAL' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export interface OrderItemCreateProps {
  id: string;
  productId: string;
  quantity: Quantity;
  unitPrice: Money;
}

export class OrderItem {
  private constructor(
    readonly id: string,
    readonly productId: string,
    readonly quantity: Quantity,
    readonly unitPrice: Money,
  ) {}

  static create(props: OrderItemCreateProps): OrderItem {
    if (props.productId.trim().length === 0) {
      throw new InvalidOrderItemsError('Cada item precisa de um produto.');
    }
    return new OrderItem(
      props.id,
      props.productId,
      props.quantity,
      props.unitPrice,
    );
  }

  get subtotal(): Money {
    return this.unitPrice.times(this.quantity.value);
  }
}

export interface OrderCreateProps {
  id: string;
  customerId: string;
  idempotencyKey: IdempotencyKey;
  items: OrderItem[];
  total: Money;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order {
  private constructor(
    readonly id: string,
    readonly customerId: string,
    readonly idempotencyKey: IdempotencyKey,
    private readonly _items: OrderItem[],
    readonly total: Money,
    private _status: OrderStatus,
    readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static createConfirmation(
    props: Omit<OrderCreateProps, 'status'> & { status?: OrderStatus },
  ): Order {
    if (props.items.length === 0) {
      throw new InvalidOrderItemsError();
    }
    const computedTotal = props.items.reduce(
      (total, item) => total.plus(item.subtotal),
      Money.fromCents(0),
    );
    if (!computedTotal.equals(props.total)) {
      throw new DomainError(
        'O total do pedido não confere com a soma dos itens.',
        'ORDER_TOTAL_MISMATCH',
      );
    }

    const now = new Date();
    return new Order(
      props.id,
      props.customerId,
      props.idempotencyKey,
      [...props.items],
      props.total,
      props.status ?? 'CONFIRMED',
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  get items(): readonly OrderItem[] {
    return this._items;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isPendingApproval(): boolean {
    return this._status === 'PENDING_APPROVAL';
  }

  isConfirmed(): boolean {
    return this._status === 'CONFIRMED';
  }

  approve(): void {
    if (this._status !== 'PENDING_APPROVAL') {
      throw new DomainError(
        'Somente pedidos pendentes de aprovação podem ser aprovados.',
        'INVALID_ORDER_STATE',
      );
    }
    this._status = 'CONFIRMED';
    this.touch();
  }

  reject(): void {
    if (this._status !== 'PENDING_APPROVAL') {
      throw new DomainError(
        'Somente pedidos pendentes de aprovação podem ser rejeitados.',
        'INVALID_ORDER_STATE',
      );
    }
    this._status = 'REJECTED';
    this.touch();
  }

  cancel(): void {
    if (this._status !== 'CONFIRMED') {
      throw new DomainError(
        'Somente pedidos confirmados podem ser cancelados.',
        'INVALID_ORDER_STATE',
      );
    }
    this._status = 'CANCELLED';
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
