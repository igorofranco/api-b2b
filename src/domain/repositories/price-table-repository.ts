import type { PriceTable } from '../entities/price-table.js';

export const PRICE_TABLE_REPOSITORY = Symbol('PRICE_TABLE_REPOSITORY');

export interface PriceTableRepository {
  findById(id: string): Promise<PriceTable | null>;
  save(priceTable: PriceTable): Promise<void>;
}
