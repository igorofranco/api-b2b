import type { PriceTable } from '../entities/price-table.js';
import type { Paginated, PaginationParams } from './pagination.js';

export const PRICE_TABLE_REPOSITORY = Symbol('PRICE_TABLE_REPOSITORY');

export interface PriceTableListParams extends PaginationParams {
  search?: string | undefined;
}

export interface PriceTableRepository {
  findById(id: string): Promise<PriceTable | null>;
  list(params: PriceTableListParams): Promise<Paginated<PriceTable>>;
  save(priceTable: PriceTable): Promise<void>;
}
