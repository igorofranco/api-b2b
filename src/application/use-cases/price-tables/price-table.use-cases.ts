import { Injectable, Inject } from '@nestjs/common';
import {
  PriceTable,
  PriceTableItem,
} from '../../../domain/entities/price-table.js';
import {
  PRICE_TABLE_REPOSITORY,
  type PriceTableRepository,
} from '../../../domain/repositories/price-table-repository.js';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../domain/repositories/product-repository.js';
import { Money } from '../../../domain/value-objects/money.js';
import { NotFoundError } from '../../errors/application-errors.js';
import { ID_GENERATOR, type IdGenerator } from '../../ports/id-generator.js';

export interface CreatePriceTableInput {
  name: string;
  validFrom: Date;
  validTo?: Date | null | undefined;
  currency?: string | undefined;
}

export interface SetPriceTableItemsInput {
  priceTableId: string;
  items: Array<{ productId: string; priceCents: number }>;
}

@Injectable()
export class CreatePriceTableUseCase {
  constructor(
    @Inject(PRICE_TABLE_REPOSITORY)
    private readonly priceTables: PriceTableRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute(input: CreatePriceTableInput): Promise<string> {
    const priceTable = PriceTable.create({
      id: this.ids.generate(),
      name: input.name,
      currency: input.currency,
      validFrom: input.validFrom,
      validTo: input.validTo,
    });

    await this.priceTables.save(priceTable);

    return priceTable.id;
  }
}

@Injectable()
export class SetPriceTableItemsUseCase {
  constructor(
    @Inject(PRICE_TABLE_REPOSITORY)
    private readonly priceTables: PriceTableRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(input: SetPriceTableItemsInput): Promise<void> {
    const priceTable = await this.priceTables.findById(input.priceTableId);
    if (!priceTable) {
      throw new NotFoundError('Tabela de preço', input.priceTableId);
    }

    const productIds = input.items.map((item) => item.productId);
    const found = await this.products.findByIds(productIds);
    const foundIds = new Set(found.map((product) => product.id));

    for (const item of input.items) {
      if (!foundIds.has(item.productId)) {
        throw new NotFoundError('Produto', item.productId);
      }
    }

    priceTable.replaceItems(
      input.items.map((item) =>
        PriceTableItem.create({
          productId: item.productId,
          price: Money.fromCents(item.priceCents),
        }),
      ),
    );

    await this.priceTables.save(priceTable);
  }
}
