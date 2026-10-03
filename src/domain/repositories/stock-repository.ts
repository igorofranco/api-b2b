import type { Stock } from '../entities/stock.js';

export const STOCK_REPOSITORY = Symbol('STOCK_REPOSITORY');

export interface StockRepository {
  findByProductId(productId: string): Promise<Stock | null>;
  findByProductIds(productIds: readonly string[]): Promise<Stock[]>;
  save(stock: Stock): Promise<void>;
}
