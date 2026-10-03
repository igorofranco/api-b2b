import { DomainError } from '../errors/domain-error.js';
import { Quantity } from '../value-objects/quantity.js';

export interface StockCreateProps {
  id: string;
  productId: string;
  quantityOnHand: number;
  quantityReserved?: number;
  updatedAt?: Date;
}

export class Stock {
  private constructor(
    readonly id: string,
    readonly productId: string,
    private _quantityOnHand: number,
    private _quantityReserved: number,
    private _updatedAt: Date,
  ) {}

  static create(props: StockCreateProps): Stock {
    if (!Number.isInteger(props.quantityOnHand) || props.quantityOnHand < 0) {
      throw new DomainError(
        'A quantidade física não pode ser negativa.',
        'INVALID_STOCK_ON_HAND',
      );
    }
    const reserved = props.quantityReserved ?? 0;
    if (!Number.isInteger(reserved) || reserved < 0) {
      throw new DomainError(
        'A quantidade reservada não pode ser negativa.',
        'INVALID_STOCK_RESERVED',
      );
    }
    if (reserved > props.quantityOnHand) {
      throw new DomainError(
        'A quantidade reservada não pode exceder a física.',
        'RESERVED_EXCEEDS_ON_HAND',
      );
    }

    return new Stock(
      props.id,
      props.productId,
      props.quantityOnHand,
      reserved,
      props.updatedAt ?? new Date(),
    );
  }

  get quantityOnHand(): number {
    return this._quantityOnHand;
  }

  get quantityReserved(): number {
    return this._quantityReserved;
  }

  get available(): number {
    return this._quantityOnHand - this._quantityReserved;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  hasAvailability(quantity: Quantity): boolean {
    return this.available >= quantity.value;
  }

  reserve(quantity: Quantity): void {
    if (!this.hasAvailability(quantity)) {
      throw new DomainError(
        'Não há estoque disponível para a quantidade solicitada.',
        'INSUFFICIENT_STOCK',
      );
    }
    this._quantityReserved += quantity.value;
    this.touch();
  }

  release(quantity: Quantity): void {
    if (quantity.value > this._quantityReserved) {
      throw new DomainError(
        'Não é possível liberar mais do que está reservado.',
        'RELEASE_EXCEEDS_RESERVED',
      );
    }
    this._quantityReserved -= quantity.value;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
