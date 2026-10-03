import { Inject, Injectable } from '@nestjs/common';
import {
  PRICE_TABLE_REPOSITORY,
  type PriceTableRepository,
} from '../../../domain/repositories/price-table-repository.js';
import type { PaginatedOutput } from '../../dtos/pagination.js';
import type { PriceTableOutput } from '../../dtos/price-table-output.js';
import { toPriceTableOutput } from './price-table.mapper.js';

export interface ListPriceTablesInput {
  page: number;
  limit: number;
  search?: string | undefined;
}

@Injectable()
export class ListPriceTablesUseCase {
  constructor(
    @Inject(PRICE_TABLE_REPOSITORY)
    private readonly priceTables: PriceTableRepository,
  ) {}

  async execute(
    input: ListPriceTablesInput,
  ): Promise<PaginatedOutput<PriceTableOutput>> {
    const { items, total } = await this.priceTables.list({
      page: input.page,
      limit: input.limit,
      search: input.search,
    });

    return {
      items: items.map(toPriceTableOutput),
      total,
      page: input.page,
      limit: input.limit,
    };
  }
}
