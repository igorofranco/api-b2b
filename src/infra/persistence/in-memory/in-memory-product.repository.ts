import type { Product } from '../../../domain/entities/product.js';
import type { ProductRepository } from '../../../domain/repositories/product-repository.js';
import type { Sku } from '../../../domain/value-objects/sku.js';

export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>();

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findByIds(ids: readonly string[]): Promise<Product[]> {
    return ids
      .map((id) => this.products.get(id))
      .filter((product): product is Product => product !== undefined);
  }

  async findBySku(sku: Sku): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (product.sku.equals(sku)) {
        return product;
      }
    }
    return null;
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }
}
