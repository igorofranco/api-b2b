import type { Product } from '../entities/product.js';
import type { Sku } from '../value-objects/sku.js';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByIds(ids: readonly string[]): Promise<Product[]>;
  findBySku(sku: Sku): Promise<Product | null>;
  save(product: Product): Promise<void>;
}
