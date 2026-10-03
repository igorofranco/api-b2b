import { describe, expect, it } from 'vitest';
import { Order, OrderItem } from './order.js';
import { Stock } from './stock.js';
import { CreditPolicy } from '../services/credit-policy.js';
import { StockReservationService } from '../services/stock-reservation-service.js';
import { IdempotencyKey } from '../value-objects/idempotency-key.js';
import { Money } from '../value-objects/money.js';
import { Quantity } from '../value-objects/quantity.js';

function buildOrder(
  status: 'CONFIRMED' | 'PENDING_APPROVAL' = 'PENDING_APPROVAL',
): Order {
  return Order.createConfirmation({
    id: 'o1',
    customerId: 'c1',
    idempotencyKey: IdempotencyKey.create('6f2a1c3e-9d4b'),
    items: [
      OrderItem.create({
        id: 'i1',
        productId: 'p1',
        quantity: Quantity.create(2),
        unitPrice: Money.fromCents(1500),
      }),
    ],
    total: Money.fromCents(3000),
    status,
  });
}

describe('Order (máquina de estados)', () => {
  it('confirma direto quando dentro do limite', () => {
    const order = buildOrder('CONFIRMED');
    expect(order.isConfirmed()).toBe(true);

    order.cancel();
    expect(order.status).toBe('CANCELLED');
  });

  it('aprova apenas pedidos pendentes', () => {
    const order = buildOrder('PENDING_APPROVAL');
    order.approve();
    expect(order.status).toBe('CONFIRMED');
    expect(() => order.approve()).toThrow();
  });

  it('rejeita pedido pendente', () => {
    const order = buildOrder('PENDING_APPROVAL');
    order.reject();
    expect(order.status).toBe('REJECTED');
    expect(() => order.reject()).toThrow();
  });

  it('não cancela pedido não confirmado', () => {
    expect(() => buildOrder('PENDING_APPROVAL').cancel()).toThrow();
  });

  it('rejeita total divergente da soma dos itens', () => {
    expect(() =>
      Order.createConfirmation({
        id: 'o2',
        customerId: 'c1',
        idempotencyKey: IdempotencyKey.create('6f2a1c3e-9d4b'),
        items: [
          OrderItem.create({
            id: 'i1',
            productId: 'p1',
            quantity: Quantity.create(2),
            unitPrice: Money.fromCents(1500),
          }),
        ],
        total: Money.fromCents(9999),
        status: 'CONFIRMED',
      }),
    ).toThrow();
  });
});

describe('Stock (invariantes)', () => {
  it('reserva e libera', () => {
    const stock = Stock.create({
      id: 's1',
      productId: 'p1',
      quantityOnHand: 10,
    });
    stock.reserve(Quantity.create(4));
    expect(stock.available).toBe(6);

    stock.release(Quantity.create(4));
    expect(stock.available).toBe(10);
  });

  it('não permite reservar além do disponível', () => {
    const stock = Stock.create({
      id: 's1',
      productId: 'p1',
      quantityOnHand: 3,
    });
    expect(() => stock.reserve(Quantity.create(4))).toThrow();
  });
});

describe('CreditPolicy', () => {
  it('confirma direto quando total + exposição cabe no limite', () => {
    expect(
      CreditPolicy.canConfirmDirectly(
        Money.fromCents(3000),
        Money.fromCents(2000),
        Money.fromCents(5000),
      ),
    ).toBe(true);
  });

  it('não confirma quando excede o limite', () => {
    expect(
      CreditPolicy.canConfirmDirectly(
        Money.fromCents(3001),
        Money.fromCents(2000),
        Money.fromCents(5000),
      ),
    ).toBe(false);
  });
});

describe('StockReservationService', () => {
  it('considera a soma das quantidades do mesmo produto', () => {
    const stock = Stock.create({
      id: 's1',
      productId: 'p1',
      quantityOnHand: 10,
    });
    const canReserve = StockReservationService.canReserveAll([
      { stock, quantity: Quantity.create(6) },
      { stock, quantity: Quantity.create(6) },
    ]);
    expect(canReserve).toBe(false);
  });

  it('libera quando a soma cabe no disponível', () => {
    const stock = Stock.create({
      id: 's1',
      productId: 'p1',
      quantityOnHand: 10,
    });
    expect(
      StockReservationService.canReserveAll([
        { stock, quantity: Quantity.create(4) },
        { stock, quantity: Quantity.create(6) },
      ]),
    ).toBe(true);
  });
});
