import { beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/infra/persistence/prisma/prisma.service.js';
import { PrismaCustomerRepository } from '../src/infra/persistence/prisma/repositories/prisma-customer.repository.js';
import { PrismaProductRepository } from '../src/infra/persistence/prisma/repositories/prisma-product.repository.js';
import { PrismaPriceTableRepository } from '../src/infra/persistence/prisma/repositories/prisma-price-table.repository.js';
import { PrismaStockRepository } from '../src/infra/persistence/prisma/repositories/prisma-stock.repository.js';
import { PrismaStockLock } from '../src/infra/persistence/prisma/prisma-stock-lock.js';
import { PrismaOrderRepository } from '../src/infra/persistence/prisma/repositories/prisma-order.repository.js';
import { CreateOrderUseCase } from '../src/application/use-cases/orders/create-order.use-case.js';
import { ApproveOrderUseCase } from '../src/application/use-cases/orders/approve-order.use-case.js';
import { CryptoIdGenerator } from '../src/infra/id/crypto-id-generator.js';
import { Cnpj } from '../src/domain/value-objects/cnpj.js';

const SEED_CUSTOMER_CNPJ = '11222333000181';
const CONSTRUTORA_CNPJ = '34028316000103';
const FURADEIRA_850_PRODUCT_ID = 'd0000000-0000-4000-8000-000000000012';
describe('Persistência Prisma (integração)', () => {
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = new PrismaService();
  });

  it('lê o cliente e a tabela de preço do seed', async () => {
    const customers = new PrismaCustomerRepository(prisma);
    const priceTables = new PrismaPriceTableRepository(prisma);

    const customer = await customers.findByCnpj(
      Cnpj.create(SEED_CUSTOMER_CNPJ),
    );
    expect(customer).not.toBeNull();

    const priceTable = await priceTables.findById(customer!.priceTableId);
    expect(priceTable).not.toBeNull();
    expect(priceTable!.items.length).toBeGreaterThan(0);
  });

  it('lê produtos e estoque do seed', async () => {
    const products = new PrismaProductRepository(prisma);
    const stocks = new PrismaStockRepository(prisma);

    const found = await products.findByIds([
      'd0000000-0000-4000-8000-000000000001',
    ]);
    expect(found).toHaveLength(1);

    const stock = await stocks.findByProductId(found[0]!.id);
    expect(stock?.quantityOnHand).toBeGreaterThan(0);
  });

  it('nunca deixa o estoque negativo sob criação concorrente', async () => {
    const customers = new PrismaCustomerRepository(prisma);
    const products = new PrismaProductRepository(prisma);
    const priceTables = new PrismaPriceTableRepository(prisma);
    const orders = new PrismaOrderRepository(prisma);
    const stocks = new PrismaStockRepository(prisma);
    const stockLock = new PrismaStockLock(prisma);
    const ids = new CryptoIdGenerator();

    const customer = await customers.findByCnpj(
      Cnpj.create(SEED_CUSTOMER_CNPJ),
    );
    const stock = await stocks.findByProductId(
      'd0000000-0000-4000-8000-000000000020',
    );
    expect(stock).not.toBeNull();

    const createOrder = new CreateOrderUseCase(
      customers,
      products,
      priceTables,
      orders,
      stockLock,
      ids,
    );

    const available = stock!.available;
    const attempts = Math.max(available + 1, 2);

    const results = await Promise.allSettled(
      Array.from({ length: attempts }, (_, index) =>
        createOrder.execute({
          customerId: customer!.id,
          idempotencyKey: `concurrent-${Date.now()}-${index}`,
          items: [
            { productId: 'd0000000-0000-4000-8000-000000000020', quantity: 1 },
          ],
        }),
      ),
    );

    const confirmed = results.filter(
      (result) =>
        result.status === 'fulfilled' && result.value.status === 'CONFIRMED',
    );
    expect(confirmed.length).toBeLessThanOrEqual(available);

    const after = await stocks.findByProductId(
      'd0000000-0000-4000-8000-000000000020',
    );
    expect(after!.available).toBeGreaterThanOrEqual(0);
    expect(after!.quantityReserved).toBeLessThanOrEqual(after!.quantityOnHand);
  }, 30000);

  it('reserva estoque ao aprovar pedido acima do limite (integração)', async () => {
    const customers = new PrismaCustomerRepository(prisma);
    const products = new PrismaProductRepository(prisma);
    const priceTables = new PrismaPriceTableRepository(prisma);
    const orders = new PrismaOrderRepository(prisma);
    const stocks = new PrismaStockRepository(prisma);
    const stockLock = new PrismaStockLock(prisma);
    const ids = new CryptoIdGenerator();

    const customer = await customers.findByCnpj(Cnpj.create(CONSTRUTORA_CNPJ));
    const before = await stocks.findByProductId(FURADEIRA_850_PRODUCT_ID);

    const createOrder = new CreateOrderUseCase(
      customers,
      products,
      priceTables,
      orders,
      stockLock,
      ids,
    );
    const approveOrder = new ApproveOrderUseCase(orders, stockLock, ids);

    const order = await createOrder.execute({
      customerId: customer!.id,
      idempotencyKey: `approve-${Date.now()}`,
      items: [{ productId: FURADEIRA_850_PRODUCT_ID, quantity: 23 }],
    });

    expect(order.status).toBe('PENDING_APPROVAL');
    await approveOrder.execute(order.id);

    const after = await stocks.findByProductId(FURADEIRA_850_PRODUCT_ID);
    expect(after!.quantityReserved).toBe(before!.quantityReserved + 23);
  }, 30000);
});
