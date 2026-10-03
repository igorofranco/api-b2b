import { DomainError } from '../errors/domain-error.js';
import { Quantity } from '../value-objects/quantity.js';

export type StockReservationStatus = 'ACTIVE' | 'RELEASED';

export interface StockReservationCreateProps {
  id: string;
  orderId: string;
  productId: string;
  customerId: string;
  quantity: Quantity;
  status?: StockReservationStatus;
  createdAt?: Date;
}

export class StockReservation {
  private constructor(
    readonly id: string,
    readonly orderId: string,
    readonly productId: string,
    readonly customerId: string,
    readonly quantity: Quantity,
    private _status: StockReservationStatus,
    readonly createdAt: Date,
  ) {}

  static create(props: StockReservationCreateProps): StockReservation {
    if (
      props.productId.trim().length === 0 ||
      props.customerId.trim().length === 0
    ) {
      throw new DomainError(
        'A reserva precisa de produto e cliente.',
        'INVALID_STOCK_RESERVATION',
      );
    }
    return new StockReservation(
      props.id,
      props.orderId,
      props.productId,
      props.customerId,
      props.quantity,
      props.status ?? 'ACTIVE',
      props.createdAt ?? new Date(),
    );
  }

  get status(): StockReservationStatus {
    return this._status;
  }

  isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  release(): void {
    if (this._status !== 'ACTIVE') {
      throw new DomainError(
        'A reserva já foi liberada.',
        'INVALID_STOCK_RESERVATION_STATE',
      );
    }
    this._status = 'RELEASED';
  }
}
