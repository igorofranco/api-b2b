import { describe, expect, it } from 'vitest';
import { seedFixture } from './testing/seed-fixture.js';
import { ListCustomersUseCase } from './customers/list-customers.use-case.js';
import { GetCustomerUseCase } from './customers/get-customer.use-case.js';
import { UpdateCustomerUseCase } from './customers/update-customer.use-case.js';
import { ListProductsUseCase } from './products/list-products.use-case.js';
import { GetProductUseCase } from './products/get-product.use-case.js';
import { UpdateProductUseCase } from './products/update-product.use-case.js';

describe('ListCustomersUseCase', () => {
  it('pagina e filtra clientes por status e busca', async () => {
    const fixture = await seedFixture();
    const list = new ListCustomersUseCase(fixture.repositories.customers);

    const page = await list.execute({ page: 1, limit: 10 });
    expect(page.total).toBe(1);
    expect(page.items[0]?.id).toBe(fixture.customerId);

    const empty = await list.execute({
      page: 1,
      limit: 10,
      status: 'INACTIVE',
    });
    expect(empty.total).toBe(0);

    const bySearch = await list.execute({
      page: 1,
      limit: 10,
      search: 'teste',
    });
    expect(bySearch.total).toBe(1);

    const noMatch = await list.execute({
      page: 1,
      limit: 10,
      search: 'inexistente',
    });
    expect(noMatch.total).toBe(0);
  });

  it('respeita o limite da página', async () => {
    const fixture = await seedFixture();
    const list = new ListCustomersUseCase(fixture.repositories.customers);

    const page = await list.execute({ page: 2, limit: 1 });
    expect(page.items).toHaveLength(0);
    expect(page.page).toBe(2);
  });
});

describe('GetCustomerUseCase', () => {
  it('devolve o cliente pelo id', async () => {
    const fixture = await seedFixture();
    const get = new GetCustomerUseCase(fixture.repositories.customers);

    const customer = await get.execute(fixture.customerId);
    expect(customer.id).toBe(fixture.customerId);
  });

  it('lança erro para cliente inexistente', async () => {
    const fixture = await seedFixture();
    const get = new GetCustomerUseCase(fixture.repositories.customers);

    await expect(get.execute('ghost')).rejects.toThrow();
  });
});

describe('UpdateCustomerUseCase', () => {
  it('atualiza nome e limite', async () => {
    const fixture = await seedFixture();
    const update = new UpdateCustomerUseCase(fixture.repositories.customers);

    const customer = await update.execute({
      customerId: fixture.customerId,
      name: 'Cliente renomeado',
      creditLimitCents: 900000,
    });

    expect(customer.name).toBe('Cliente renomeado');
    expect(customer.creditLimitCents).toBe(900000);
  });
});

describe('ListProductsUseCase', () => {
  it('pagina e filtra produtos', async () => {
    const fixture = await seedFixture();
    const list = new ListProductsUseCase(fixture.repositories.products);

    const page = await list.execute({ page: 1, limit: 10 });
    expect(page.total).toBe(2);

    const byName = await list.execute({
      page: 1,
      limit: 10,
      search: 'produto a',
    });
    expect(byName.total).toBe(1);
    expect(byName.items[0]?.sku).toBe('PROD-A');

    const bySku = await list.execute({
      page: 1,
      limit: 10,
      search: 'PROD-B',
    });
    expect(bySku.total).toBe(1);
  });
});

describe('GetProductUseCase e UpdateProductUseCase', () => {
  it('busca e atualiza produto', async () => {
    const fixture = await seedFixture();
    const get = new GetProductUseCase(fixture.repositories.products);
    const update = new UpdateProductUseCase(fixture.repositories.products);

    const updated = await update.execute({
      productId: fixture.productAId,
      name: 'Produto A revisado',
      basePriceCents: 3500,
    });
    expect(updated.name).toBe('Produto A revisado');
    expect(updated.basePriceCents).toBe(3500);

    const fetched = await get.execute(fixture.productAId);
    expect(fetched.name).toBe('Produto A revisado');
  });

  it('lança erro para produto inexistente', async () => {
    const fixture = await seedFixture();
    const get = new GetProductUseCase(fixture.repositories.products);
    await expect(get.execute('ghost')).rejects.toThrow();
  });
});
