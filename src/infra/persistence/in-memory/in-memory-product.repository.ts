import type { Product } from '../../../domain/entities/product.js';
import type {
  ProductListParams,
  ProductRepository,
} from '../../../domain/repositories/product-repository.js';
import type { Paginated } from '../../../domain/repositories/pagination.js';
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

  async list(params: ProductListParams): Promise<Paginated<Product>> {
    const search = params.search?.trim().toLowerCase();
    const filtered = [...this.products.values()].filter((product) => {
      if (params.status !== undefined && product.status !== params.status) {
        return false;
      }
      if (search) {
        return (
          product.name.toLowerCase().includes(search) ||
          product.sku.value.toLowerCase().includes(search)
        );
      }
      return true;
    });

    return {
      items: filtered.slice(
        (params.page - 1) * params.limit,
        (params.page - 1) * params.limit + params.limit,
      ),
      total: filtered.length,
    };
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }
}
