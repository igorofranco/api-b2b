import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../domain/repositories/product-repository.js';
import { Money } from '../../../domain/value-objects/money.js';
import { NotFoundError } from '../../errors/application-errors.js';
import type { ProductOutput } from '../../dtos/product-output.js';
import { toProductOutput } from './product.mapper.js';

export interface UpdateProductInput {
  productId: string;
  name?: string | undefined;
  description?: string | null | undefined;
  unit?: string | undefined;
  basePriceCents?: number | undefined;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(input: UpdateProductInput): Promise<ProductOutput> {
    const product = await this.products.findById(input.productId);
    if (!product) {
      throw new NotFoundError('Produto', input.productId);
    }

    product.updateDetails(this.buildDetails(input));
    if (input.basePriceCents !== undefined) {
      product.changeBasePrice(Money.fromCents(input.basePriceCents));
    }

    await this.products.save(product);

    return toProductOutput(product);
  }

  private buildDetails(input: UpdateProductInput): {
    name?: string;
    description?: string | null;
    unit?: string;
  } {
    const details: {
      name?: string;
      description?: string | null;
      unit?: string;
    } = {};
    if (input.name !== undefined) {
      details.name = input.name;
    }
    if (input.description !== undefined) {
      details.description = input.description;
    }
    if (input.unit !== undefined) {
      details.unit = input.unit;
    }
    return details;
  }
}
