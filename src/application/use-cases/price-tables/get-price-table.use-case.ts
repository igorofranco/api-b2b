import { Inject, Injectable } from '@nestjs/common';
import {
  PRICE_TABLE_REPOSITORY,
  type PriceTableRepository,
} from '../../../domain/repositories/price-table-repository.js';
import { NotFoundError } from '../../errors/application-errors.js';
import type { PriceTableOutput } from '../../dtos/price-table-output.js';
import { toPriceTableOutput } from './price-table.mapper.js';

@Injectable()
export class GetPriceTableUseCase {
  constructor(
    @Inject(PRICE_TABLE_REPOSITORY)
    private readonly priceTables: PriceTableRepository,
  ) {}

  async execute(priceTableId: string): Promise<PriceTableOutput> {
    const priceTable = await this.priceTables.findById(priceTableId);
    if (!priceTable) {
      throw new NotFoundError('Tabela de preço', priceTableId);
    }

    return toPriceTableOutput(priceTable);
  }
}
