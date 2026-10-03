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

export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string | null;
  unit: string;
  basePriceCents: number;
}

export interface ProductOutput {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  basePriceCents: number;
  status: string;
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

    return {
      id: product.id,
      sku: product.sku.value,
      name: product.name,
      description: product.description,
      unit: product.unit,
      basePriceCents: product.basePrice.cents,
      status: product.status,
    };
  }
}
