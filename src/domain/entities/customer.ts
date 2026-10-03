import { DomainError } from '../errors/domain-error.js';
import { InvalidCustomerStatusError } from '../errors/invalid-customer-status.error.js';
import { InvalidMoneyError } from '../errors/invalid-money.error.js';
import { Cnpj } from '../value-objects/cnpj.js';
import { Money } from '../value-objects/money.js';

export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface CustomerCreateProps {
  id: string;
  name: string;
  cnpj: Cnpj;
  creditLimit: Money;
  priceTableId: string;
  status?: CustomerStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer {
  private constructor(
    readonly id: string,
    private _name: string,
    readonly cnpj: Cnpj,
    private _creditLimit: Money,
    private _priceTableId: string,
    private _status: CustomerStatus,
    readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CustomerCreateProps): Customer {
    if (props.name.trim().length < 2) {
      throw new DomainError(
        'O nome do cliente é obrigatório.',
        'INVALID_CUSTOMER_NAME',
      );
    }
    if (props.priceTableId.trim().length === 0) {
      throw new DomainError(
        'O cliente precisa de uma tabela de preço.',
        'MISSING_PRICE_TABLE',
      );
    }
    if (props.creditLimit.cents < 0) {
      throw new InvalidMoneyError('O limite de crédito não pode ser negativo.');
    }

    const now = new Date();
    return new Customer(
      props.id,
      props.name.trim(),
      props.cnpj,
      props.creditLimit,
      props.priceTableId,
      props.status ?? 'ACTIVE',
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  get name(): string {
    return this._name;
  }

  get creditLimit(): Money {
    return this._creditLimit;
  }

  get priceTableId(): string {
    return this._priceTableId;
  }

  get status(): CustomerStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  rename(name: string): void {
    if (name.trim().length < 2) {
      throw new DomainError(
        'O nome do cliente é obrigatório.',
        'INVALID_CUSTOMER_NAME',
      );
    }
    this._name = name.trim();
    this.touch();
  }

  changeCreditLimit(creditLimit: Money): void {
    if (creditLimit.cents < 0) {
      throw new InvalidMoneyError('O limite de crédito não pode ser negativo.');
    }
    this._creditLimit = creditLimit;
    this.touch();
  }

  changePriceTable(priceTableId: string): void {
    if (priceTableId.trim().length === 0) {
      throw new DomainError(
        'O cliente precisa de uma tabela de preço.',
        'MISSING_PRICE_TABLE',
      );
    }
    this._priceTableId = priceTableId;
    this.touch();
  }

  activate(): void {
    if (this._status === 'ACTIVE') {
      throw new InvalidCustomerStatusError('O cliente já está ativo.');
    }
    this._status = 'ACTIVE';
    this.touch();
  }

  deactivate(): void {
    if (this._status === 'INACTIVE') {
      throw new InvalidCustomerStatusError('O cliente já está inativo.');
    }
    this._status = 'INACTIVE';
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
