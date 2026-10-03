import type { Product } from '../../../domain/entities/product.js';
import type { ProductOutput } from '../../dtos/product-output.js';

export function toProductOutput(product: Product): ProductOutput {
  return {
    id: product.id,
    sku: product.sku.value,
    name: product.name,
    description: product.description,
    unit: product.unit,
    basePriceCents: product.basePrice.cents,
    status: product.status,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
