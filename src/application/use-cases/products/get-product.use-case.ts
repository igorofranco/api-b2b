import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../domain/repositories/product-repository.js';
import { NotFoundError } from '../../errors/application-errors.js';
import type { ProductOutput } from '../../dtos/product-output.js';
import { toProductOutput } from './product.mapper.js';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(productId: string): Promise<ProductOutput> {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new NotFoundError('Produto', productId);
    }

    return toProductOutput(product);
  }
}
