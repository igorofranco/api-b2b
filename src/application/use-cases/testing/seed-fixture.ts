import { Customer } from '../../../domain/entities/customer.js';
import {
  PriceTable,
  PriceTableItem,
} from '../../../domain/entities/price-table.js';
import { Product } from '../../../domain/entities/product.js';
import { Stock } from '../../../domain/entities/stock.js';
import { Cnpj } from '../../../domain/value-objects/cnpj.js';
import { Money } from '../../../domain/value-objects/money.js';
import { Sku } from '../../../domain/value-objects/sku.js';
import { InMemoryRepositories } from '../../../infra/persistence/in-memory/in-memory-repositories.js';

export const CUSTOMER_ID = 'c1';
export const PRICE_TABLE_ID = 'pt1';
export const PRODUCT_A_ID = 'p1';
export const PRODUCT_B_ID = 'p2';

export interface SeededFixture {
  repositories: InMemoryRepositories;
  customerId: string;
  priceTableId: string;
  productAId: string;
  productBId: string;
}

export async function seedFixture(options?: {
  creditLimitCents?: number;
  productAOnHand?: number;
  customerActive?: boolean;
}): Promise<SeededFixture> {
  const repositories = new InMemoryRepositories();

  await repositories.products.save(
    Product.create({
      id: PRODUCT_A_ID,
      sku: Sku.create('PROD-A'),
      name: 'Produto A',
      unit: 'UN',
      basePrice: Money.fromCents(2000),
    }),
  );
  await repositories.products.save(
    Product.create({
      id: PRODUCT_B_ID,
      sku: Sku.create('PROD-B'),
      name: 'Produto B',
      unit: 'UN',
      basePrice: Money.fromCents(5000),
    }),
  );

  await repositories.priceTables.save(
    PriceTable.create({
      id: PRICE_TABLE_ID,
      name: 'Contrato de teste',
      validFrom: new Date('2026-01-01T00:00:00.000Z'),
      items: [
        PriceTableItem.create({
          productId: PRODUCT_A_ID,
          price: Money.fromCents(1500),
        }),
      ],
    }),
  );

  const customer = Customer.create({
    id: CUSTOMER_ID,
    name: 'Cliente de teste',
    cnpj: Cnpj.create('11222333000181'),
    creditLimit: Money.fromCents(options?.creditLimitCents ?? 1_000_000),
    priceTableId: PRICE_TABLE_ID,
  });
  if (options?.customerActive === false) {
    customer.deactivate();
  }
  await repositories.customers.save(customer);

  await repositories.stocks.save(
    Stock.create({
      id: 's1',
      productId: PRODUCT_A_ID,
      quantityOnHand: options?.productAOnHand ?? 100,
    }),
  );
  await repositories.stocks.save(
    Stock.create({ id: 's2', productId: PRODUCT_B_ID, quantityOnHand: 100 }),
  );

  return {
    repositories,
    customerId: CUSTOMER_ID,
    priceTableId: PRICE_TABLE_ID,
    productAId: PRODUCT_A_ID,
    productBId: PRODUCT_B_ID,
  };
}
