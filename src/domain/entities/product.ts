import { DomainError } from '../errors/domain-error.js';
import { InvalidMoneyError } from '../errors/invalid-money.error.js';
import { Money } from '../value-objects/money.js';
import { Sku } from '../value-objects/sku.js';

export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface ProductCreateProps {
  id: string;
  sku: Sku;
  name: string;
  description?: string | null | undefined;
  unit: string;
  basePrice: Money;
  status?: ProductStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private constructor(
    readonly id: string,
    readonly sku: Sku,
    private _name: string,
    private _description: string | null,
    private _unit: string,
    private _basePrice: Money,
    private _status: ProductStatus,
    readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: ProductCreateProps): Product {
    if (props.name.trim().length < 2) {
      throw new DomainError(
        'O nome do produto é obrigatório.',
        'INVALID_PRODUCT_NAME',
      );
    }
    if (props.unit.trim().length === 0) {
      throw new DomainError(
        'A unidade do produto é obrigatória.',
        'INVALID_PRODUCT_UNIT',
      );
    }
    if (props.basePrice.cents <= 0) {
      throw new InvalidMoneyError('O preço base deve ser maior que zero.');
    }

    const now = new Date();
    return new Product(
      props.id,
      props.sku,
      props.name.trim(),
      props.description?.trim() ?? null,
      props.unit.trim(),
      props.basePrice,
      props.status ?? 'ACTIVE',
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get unit(): string {
    return this._unit;
  }

  get basePrice(): Money {
    return this._basePrice;
  }

  get status(): ProductStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  updateDetails(props: {
    name?: string;
    description?: string | null;
    unit?: string;
  }): void {
    if (props.name !== undefined) {
      if (props.name.trim().length < 2) {
        throw new DomainError(
          'O nome do produto é obrigatório.',
          'INVALID_PRODUCT_NAME',
        );
      }
      this._name = props.name.trim();
    }
    if (props.description !== undefined) {
      this._description = props.description?.trim() ?? null;
    }
    if (props.unit !== undefined) {
      if (props.unit.trim().length === 0) {
        throw new DomainError(
          'A unidade do produto é obrigatória.',
          'INVALID_PRODUCT_UNIT',
        );
      }
      this._unit = props.unit.trim();
    }
    this.touch();
  }

  changeBasePrice(basePrice: Money): void {
    if (basePrice.cents <= 0) {
      throw new InvalidMoneyError('O preço base deve ser maior que zero.');
    }
    this._basePrice = basePrice;
    this.touch();
  }

  activate(): void {
    this._status = 'ACTIVE';
    this.touch();
  }

  deactivate(): void {
    this._status = 'INACTIVE';
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
