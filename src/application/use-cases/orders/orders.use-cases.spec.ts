import { beforeEach, describe, expect, it } from 'vitest';
import { CreateOrderUseCase } from './create-order.use-case.js';
import { ApproveOrderUseCase } from './approve-order.use-case.js';
import { RejectOrderUseCase } from './reject-order.use-case.js';
import { CancelOrderUseCase } from './cancel-order.use-case.js';
import { seedFixture, type SeededFixture } from '../testing/seed-fixture.js';

function buildUseCases(fixture: SeededFixture) {
  const { repositories } = fixture;
  return {
    createOrder: new CreateOrderUseCase(
      repositories.customers,
      repositories.products,
      repositories.priceTables,
      repositories.orders,
      repositories.stockLock,
      repositories.ids,
    ),
    approveOrder: new ApproveOrderUseCase(
      repositories.orders,
      repositories.stockLock,
      repositories.ids,
    ),
    rejectOrder: new RejectOrderUseCase(repositories.orders),
    cancelOrder: new CancelOrderUseCase(
      repositories.orders,
      repositories.reservations,
      repositories.stockLock,
    ),
  };
}

describe('CreateOrderUseCase', () => {
  let fixture: SeededFixture;

  beforeEach(async () => {
    fixture = await seedFixture();
  });

  it('resolve o preço pela tabela do cliente e confirma dentro do limite', async () => {
    const { createOrder } = buildUseCases(fixture);

    const order = await createOrder.execute({
      customerId: fixture.customerId,
      idempotencyKey: 'key-0001',
      items: [{ productId: fixture.productAId, quantity: 2 }],
    });

    expect(order.status).toBe('CONFIRMED');
    expect(order.totalCents).toBe(3000);
    expect(order.items[0]?.unitPriceCents).toBe(1500);

    const stock = await fixture.repositories.stocks.findByProductId(
      fixture.productAId,
    );
    expect(stock?.quantityReserved).toBe(2);
  });

  it('usa o preço base quando não há item na tabela', async () => {
    const { createOrder } = buildUseCases(fixture);

    const order = await createOrder.execute({
      customerId: fixture.customerId,
      idempotencyKey: 'key-0002',
      items: [{ productId: fixture.productBId, quantity: 1 }],
    });

    expect(order.items[0]?.unitPriceCents).toBe(5000);
    expect(order.totalCents).toBe(5000);
  });

  it('entra em aprovação quando excede o limite de crédito', async () => {
    const smallLimit = await seedFixture({ creditLimitCents: 2000 });
    const { createOrder } = buildUseCases(smallLimit);

    const order = await createOrder.execute({
      customerId: smallLimit.customerId,
      idempotencyKey: 'key-0003',
      items: [{ productId: smallLimit.productAId, quantity: 2 }],
    });

    expect(order.status).toBe('PENDING_APPROVAL');

    const stock = await smallLimit.repositories.stocks.findByProductId(
      smallLimit.productAId,
    );
    expect(stock?.quantityReserved).toBe(0);
  });

  it('considera a exposição em aberto no limite', async () => {
    const limit = await seedFixture({ creditLimitCents: 3000 });
    const { createOrder } = buildUseCases(limit);

    const first = await createOrder.execute({
      customerId: limit.customerId,
      idempotencyKey: 'key-0004',
      items: [{ productId: limit.productAId, quantity: 2 }],
    });
    expect(first.status).toBe('CONFIRMED');

    const second = await createOrder.execute({
      customerId: limit.customerId,
      idempotencyKey: 'key-0005',
      items: [{ productId: limit.productBId, quantity: 1 }],
    });
    expect(second.status).toBe('PENDING_APPROVAL');
  });

  it('é idempotente para a mesma chave', async () => {
    const { createOrder } = buildUseCases(fixture);

    const first = await createOrder.execute({
      customerId: fixture.customerId,
      idempotencyKey: 'key-same',
      items: [{ productId: fixture.productAId, quantity: 1 }],
    });
    const second = await createOrder.execute({
      customerId: fixture.customerId,
      idempotencyKey: 'key-same',
      items: [{ productId: fixture.productAId, quantity: 1 }],
    });

    expect(second.id).toBe(first.id);
  });

  it('rejeita cliente inativo', async () => {
    const inactive = await seedFixture({ customerActive: false });
    const { createOrder } = buildUseCases(inactive);

    await expect(
      createOrder.execute({
        customerId: inactive.customerId,
        idempotencyKey: 'key-0006',
        items: [{ productId: inactive.productAId, quantity: 1 }],
      }),
    ).rejects.toThrow(/inativo/i);
  });

  it('rejeita estoque insuficiente sem confirmar o pedido', async () => {
    const lowStock = await seedFixture({ productAOnHand: 1 });
    const { createOrder } = buildUseCases(lowStock);

    await expect(
      createOrder.execute({
        customerId: lowStock.customerId,
        idempotencyKey: 'key-0007',
        items: [{ productId: lowStock.productAId, quantity: 5 }],
      }),
    ).rejects.toThrow();

    const stock = await lowStock.repositories.stocks.findByProductId(
      lowStock.productAId,
    );
    expect(stock?.quantityReserved).toBe(0);
  });

  it('rejeita produto repetido no pedido', async () => {
    const { createOrder } = buildUseCases(fixture);

    await expect(
      createOrder.execute({
        customerId: fixture.customerId,
        idempotencyKey: 'key-0008',
        items: [
          { productId: fixture.productAId, quantity: 1 },
          { productId: fixture.productAId, quantity: 2 },
        ],
      }),
    ).rejects.toThrow();
  });
});

describe('ApproveOrderUseCase', () => {
  it('reserva estoque ao aprovar pedido acima do limite', async () => {
    const fixture = await seedFixture({ creditLimitCents: 2000 });
    const { createOrder, approveOrder } = buildUseCases(fixture);

    const order = await createOrder.execute({
      customerId: fixture.customerId,
      idempotencyKey: 'key-approve',
      items: [{ productId: fixture.productAId, quantity: 2 }],
    });
    expect(order.status).toBe('PENDING_APPROVAL');

    const status = await approveOrder.execute(order.id);
    expect(status).toBe('CONFIRMED');

    const stock = await fixture.repositories.stocks.findByProductId(
      fixture.productAId,
    );
    expect(stock?.quantityReserved).toBe(2);
  });

  it('não aprova pedido que não está pendente', async () => {
    const fixture = await seedFixture();
    const { createOrder, approveOrder } = buildUseCases(fixture);

    const order = await createOrder.execute({
      customerId: fixture.customerId,
      idempotencyKey: 'key-not-pending',
      items: [{ productId: fixture.productAId, quantity: 1 }],
    });

    await expect(approveOrder.execute(order.id)).rejects.toThrow();
  });
});

describe('RejectOrderUseCase', () => {
  it('rejeita pedido pendente sem reservar estoque', async () => {
    const fixture = await seedFixture({ creditLimitCents: 2000 });
    const { createOrder, rejectOrder } = buildUseCases(fixture);

    const order = await createOrder.execute({
      customerId: fixture.customerId,
      idempotencyKey: 'key-reject',
      items: [{ productId: fixture.productAId, quantity: 2 }],
    });

    expect(await rejectOrder.execute(order.id)).toBe('REJECTED');
  });
});

describe('CancelOrderUseCase', () => {
  it('libera a reserva ao cancelar pedido confirmado', async () => {
    const fixture = await seedFixture();
    const { createOrder, cancelOrder } = buildUseCases(fixture);

    const order = await createOrder.execute({
      customerId: fixture.customerId,
      idempotencyKey: 'key-cancel',
      items: [{ productId: fixture.productAId, quantity: 3 }],
    });

    expect(await cancelOrder.execute(order.id)).toBe('CANCELLED');

    const stock = await fixture.repositories.stocks.findByProductId(
      fixture.productAId,
    );
    expect(stock?.quantityReserved).toBe(0);
  });

  it('não cancela pedido pendente de aprovação', async () => {
    const fixture = await seedFixture({ creditLimitCents: 2000 });
    const { createOrder, cancelOrder } = buildUseCases(fixture);

    const order = await createOrder.execute({
      customerId: fixture.customerId,
      idempotencyKey: 'key-cancel-pending',
      items: [{ productId: fixture.productAId, quantity: 2 }],
    });

    await expect(cancelOrder.execute(order.id)).rejects.toThrow();
  });
});
