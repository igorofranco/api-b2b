import { Injectable, Inject } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../domain/repositories/product-repository.js';
import {
  NotFoundError,
  ProductInactiveError,
} from '../../errors/application-errors.js';

export type ProductStatusAction = 'ACTIVE' | 'INACTIVE';

export interface SetProductStatusInput {
  productId: string;
  status: ProductStatusAction;
}

@Injectable()
export class SetProductStatusUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(input: SetProductStatusInput): Promise<void> {
    const product = await this.products.findById(input.productId);
    if (!product) {
      throw new NotFoundError('Produto', input.productId);
    }

    if (input.status === 'ACTIVE') {
      product.activate();
    } else {
      product.deactivate();
    }

    await this.products.save(product);
  }
}

export function assertProductIsSellable(
  productId: string,
  active: boolean,
): void {
  if (!active) {
    throw new ProductInactiveError(productId);
  }
}
