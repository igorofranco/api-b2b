import type { ProductStatus } from '../../domain/entities/product.js';

export interface ProductOutput {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  basePriceCents: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}
