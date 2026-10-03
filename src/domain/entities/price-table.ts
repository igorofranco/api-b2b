import { DomainError } from '../errors/domain-error.js';
import { InvalidMoneyError } from '../errors/invalid-money.error.js';
import { InvalidPriceTablePeriodError } from '../errors/invalid-price-table-period.error.js';
import { Money } from '../value-objects/money.js';

export interface PriceTableItemCreateProps {
  productId: string;
  price: Money;
}

export class PriceTableItem {
  private constructor(
    readonly productId: string,
    private _price: Money,
  ) {}

  static create(props: PriceTableItemCreateProps): PriceTableItem {
    if (props.productId.trim().length === 0) {
      throw new DomainError('O item precisa de um produto.', 'MISSING_PRODUCT');
    }
    if (props.price.cents <= 0) {
      throw new InvalidMoneyError('O preço do item deve ser maior que zero.');
    }
    return new PriceTableItem(props.productId, props.price);
  }

  get price(): Money {
    return this._price;
  }

  changePrice(price: Money): void {
    if (price.cents <= 0) {
      throw new InvalidMoneyError('O preço do item deve ser maior que zero.');
    }
    this._price = price;
  }
}

export interface PriceTableCreateProps {
  id: string;
  name: string;
  currency?: string | undefined;
  validFrom: Date;
  validTo?: Date | null | undefined;
  items?: PriceTableItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class PriceTable {
  private readonly _items: Map<string, PriceTableItem>;

  private constructor(
    readonly id: string,
    private _name: string,
    readonly currency: string,
    readonly validFrom: Date,
    private _validTo: Date | null,
    items: PriceTableItem[],
    readonly createdAt: Date,
    private _updatedAt: Date,
  ) {
    this._items = new Map(items.map((item) => [item.productId, item]));
  }

  static create(props: PriceTableCreateProps): PriceTable {
    if (props.name.trim().length < 2) {
      throw new DomainError(
        'O nome da tabela de preço é obrigatório.',
        'INVALID_PRICE_TABLE_NAME',
      );
    }
    if (props.validTo && props.validTo.getTime() < props.validFrom.getTime()) {
      throw new InvalidPriceTablePeriodError();
    }

    const now = new Date();
    return new PriceTable(
      props.id,
      props.name.trim(),
      props.currency ?? 'BRL',
      props.validFrom,
      props.validTo ?? null,
      props.items ?? [],
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  get name(): string {
    return this._name;
  }

  get validTo(): Date | null {
    return this._validTo;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get items(): PriceTableItem[] {
    return [...this._items.values()];
  }

  isEffectiveAt(reference: Date): boolean {
    if (reference.getTime() < this.validFrom.getTime()) {
      return false;
    }
    return (
      this._validTo === null || reference.getTime() <= this._validTo.getTime()
    );
  }

  priceFor(productId: string): Money | null {
    return this._items.get(productId)?.price ?? null;
  }

  upsertItem(productId: string, price: Money): void {
    const existing = this._items.get(productId);
    if (existing) {
      existing.changePrice(price);
    } else {
      this._items.set(productId, PriceTableItem.create({ productId, price }));
    }
    this.touch();
  }

  replaceItems(items: PriceTableItem[]): void {
    this._items.clear();
    for (const item of items) {
      if (this._items.has(item.productId)) {
        throw new DomainError(
          'Cada produto deve aparecer uma única vez na tabela de preço.',
          'DUPLICATE_PRICE_TABLE_ITEM',
        );
      }
      this._items.set(item.productId, item);
    }
    this.touch();
  }

  rename(name: string): void {
    if (name.trim().length < 2) {
      throw new DomainError(
        'O nome da tabela de preço é obrigatório.',
        'INVALID_PRICE_TABLE_NAME',
      );
    }
    this._name = name.trim();
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
