import { InMemoryCustomerRepository } from './in-memory-customer.repository.js';
import { InMemoryOrderRepository } from './in-memory-order.repository.js';
import { InMemoryPriceTableRepository } from './in-memory-price-table.repository.js';
import { InMemoryProductRepository } from './in-memory-product.repository.js';
import { InMemoryStockRepository } from './in-memory-stock.repository.js';
import { InMemoryStockReservationRepository } from './in-memory-stock-reservation.repository.js';
import { InMemoryStockLock } from './in-memory-stock-lock.js';
import { CryptoIdGenerator } from '../../id/crypto-id-generator.js';

export class InMemoryRepositories {
  readonly customers = new InMemoryCustomerRepository();
  readonly products = new InMemoryProductRepository();
  readonly priceTables = new InMemoryPriceTableRepository();
  readonly orders = new InMemoryOrderRepository();
  readonly stocks = new InMemoryStockRepository();
  readonly reservations = new InMemoryStockReservationRepository();
  readonly stockLock = new InMemoryStockLock(this.stocks, this.reservations);
  readonly ids = new CryptoIdGenerator();
}
