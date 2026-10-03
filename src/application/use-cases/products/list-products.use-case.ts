import { Inject, Injectable } from '@nestjs/common';
import type { ProductStatus } from '../../../domain/entities/product.js';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../domain/repositories/product-repository.js';
import type { PaginatedOutput } from '../../dtos/pagination.js';
import type { ProductOutput } from '../../dtos/product-output.js';
import { toProductOutput } from './product.mapper.js';

export interface ListProductsInput {
  page: number;
  limit: number;
  status?: ProductStatus | undefined;
  search?: string | undefined;
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(
    input: ListProductsInput,
  ): Promise<PaginatedOutput<ProductOutput>> {
    const { items, total } = await this.products.list({
      page: input.page,
      limit: input.limit,
      status: input.status,
      search: input.search,
    });

    return {
      items: items.map(toProductOutput),
      total,
      page: input.page,
      limit: input.limit,
    };
  }
}
