import { beforeEach, describe, expect, it } from 'vitest';
import { CreateCustomerUseCase } from './create-customer.use-case.js';
import { SetCustomerStatusUseCase } from './set-customer-status.use-case.js';
import { UpdateCreditLimitUseCase } from './update-credit-limit.use-case.js';
import { CreateProductUseCase } from '../products/create-product.use-case.js';
import { SetProductStatusUseCase } from '../products/set-product-status.use-case.js';
import {
  CreatePriceTableUseCase,
  SetPriceTableItemsUseCase,
} from '../price-tables/price-table.use-cases.js';
import { seedFixture, type SeededFixture } from '../testing/seed-fixture.js';

describe('CreateCustomerUseCase', () => {
  let fixture: SeededFixture;

  beforeEach(async () => {
    fixture = await seedFixture();
  });

  it('cria cliente com CNPJ válido', async () => {
    const useCase = new CreateCustomerUseCase(
      fixture.repositories.customers,
      fixture.repositories.priceTables,
      fixture.repositories.ids,
    );

    const customer = await useCase.execute({
      name: 'Nova Empresa LTDA',
      cnpj: '11444777000161',
      creditLimitCents: 500000,
      priceTableId: fixture.priceTableId,
    });

    expect(customer.id).toBeTruthy();
    expect(customer.cnpj).toBe('11444777000161');
  });

  it('rejeita CNPJ duplicado', async () => {
    const useCase = new CreateCustomerUseCase(
      fixture.repositories.customers,
      fixture.repositories.priceTables,
      fixture.repositories.ids,
    );

    await expect(
      useCase.execute({
        name: 'Duplicada',
        cnpj: '11222333000181',
        creditLimitCents: 500000,
        priceTableId: fixture.priceTableId,
      }),
    ).rejects.toThrow();
  });
});

describe('SetCustomerStatusUseCase', () => {
  it('inativa e reativa o cliente', async () => {
    const fixture = await seedFixture();
    const useCase = new SetCustomerStatusUseCase(
      fixture.repositories.customers,
    );

    await useCase.execute({
      customerId: fixture.customerId,
      status: 'INACTIVE',
    });
    expect(
      (
        await fixture.repositories.customers.findById(fixture.customerId)
      )?.isActive(),
    ).toBe(false);

    await useCase.execute({ customerId: fixture.customerId, status: 'ACTIVE' });
    expect(
      (
        await fixture.repositories.customers.findById(fixture.customerId)
      )?.isActive(),
    ).toBe(true);
  });
});

describe('UpdateCreditLimitUseCase', () => {
  it('atualiza o limite do cliente', async () => {
    const fixture = await seedFixture();
    const useCase = new UpdateCreditLimitUseCase(
      fixture.repositories.customers,
    );

    const limit = await useCase.execute({
      customerId: fixture.customerId,
      creditLimitCents: 750000,
    });
    expect(limit).toBe(750000);
  });
});

describe('CreateProductUseCase', () => {
  it('normaliza o SKU e persiste', async () => {
    const fixture = await seedFixture();
    const useCase = new CreateProductUseCase(
      fixture.repositories.products,
      fixture.repositories.ids,
    );

    const product = await useCase.execute({
      sku: ' novo-sku ',
      name: 'Produto novo',
      unit: 'UN',
      basePriceCents: 999,
    });

    expect(product.sku).toBe('NOVO-SKU');
  });

  it('rejeita SKU duplicado', async () => {
    const fixture = await seedFixture();
    const useCase = new CreateProductUseCase(
      fixture.repositories.products,
      fixture.repositories.ids,
    );

    await expect(
      useCase.execute({
        sku: 'PROD-A',
        name: 'Repetido',
        unit: 'UN',
        basePriceCents: 100,
      }),
    ).rejects.toThrow();
  });
});

describe('SetProductStatusUseCase', () => {
  it('inativa o produto', async () => {
    const fixture = await seedFixture();
    const useCase = new SetProductStatusUseCase(fixture.repositories.products);

    await useCase.execute({
      productId: fixture.productAId,
      status: 'INACTIVE',
    });
    expect(
      (
        await fixture.repositories.products.findById(fixture.productAId)
      )?.isActive(),
    ).toBe(false);
  });
});

describe('PriceTable use cases', () => {
  it('cria tabela e substitui itens', async () => {
    const fixture = await seedFixture();
    const create = new CreatePriceTableUseCase(
      fixture.repositories.priceTables,
      fixture.repositories.ids,
    );
    const setItems = new SetPriceTableItemsUseCase(
      fixture.repositories.priceTables,
      fixture.repositories.products,
    );

    const id = await create.execute({
      name: 'Tabela nova',
      validFrom: new Date('2026-01-01T00:00:00.000Z'),
    });

    await setItems.execute({
      priceTableId: id,
      items: [{ productId: fixture.productAId, priceCents: 1234 }],
    });

    const priceTable = await fixture.repositories.priceTables.findById(id);
    expect(priceTable?.priceFor(fixture.productAId)?.cents).toBe(1234);
  });

  it('rejeita item com produto inexistente', async () => {
    const fixture = await seedFixture();
    const setItems = new SetPriceTableItemsUseCase(
      fixture.repositories.priceTables,
      fixture.repositories.products,
    );

    await expect(
      setItems.execute({
        priceTableId: fixture.priceTableId,
        items: [{ productId: 'ghost', priceCents: 1 }],
      }),
    ).rejects.toThrow();
  });
});
