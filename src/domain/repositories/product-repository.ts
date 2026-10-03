import type { Product, ProductStatus } from '../entities/product.js';
import type { Sku } from '../value-objects/sku.js';
import type { Paginated, PaginationParams } from './pagination.js';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductListParams extends PaginationParams {
  status?: ProductStatus | undefined;
  search?: string | undefined;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByIds(ids: readonly string[]): Promise<Product[]>;
  findBySku(sku: Sku): Promise<Product | null>;
  list(params: ProductListParams): Promise<Paginated<Product>>;
  save(product: Product): Promise<void>;
}
