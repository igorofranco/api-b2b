import { Injectable, Inject } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.js';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../domain/repositories/product-repository.js';
import { Money } from '../../../domain/value-objects/money.js';
import { Sku } from '../../../domain/value-objects/sku.js';
import { DomainError } from '../../../domain/errors/domain-error.js';
import { ID_GENERATOR, type IdGenerator } from '../../ports/id-generator.js';
import type { ProductOutput } from '../../dtos/product-output.js';
import { toProductOutput } from './product.mapper.js';

export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string | null;
  unit: string;
  basePriceCents: number;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute(input: CreateProductInput): Promise<ProductOutput> {
    const sku = Sku.create(input.sku);

    if (await this.products.findBySku(sku)) {
      throw new DomainError(
        'Já existe um produto com esse SKU.',
        'SKU_ALREADY_EXISTS',
      );
    }

    const product = Product.create({
      id: this.ids.generate(),
      sku,
      name: input.name,
      description: input.description,
      unit: input.unit,
      basePrice: Money.fromCents(input.basePriceCents),
    });

    await this.products.save(product);

    return toProductOutput(product);
  }
}
