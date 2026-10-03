import { Inject, Injectable } from '@nestjs/common';
import type { CustomerStatus } from '../../../domain/entities/customer.js';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../../domain/repositories/customer-repository.js';
import type { CustomerOutput } from '../../dtos/customer-output.js';
import type { PaginatedOutput } from '../../dtos/pagination.js';
import { toCustomerOutput } from './customer.mapper.js';

export interface ListCustomersInput {
  page: number;
  limit: number;
  status?: CustomerStatus | undefined;
  search?: string | undefined;
}

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
  ) {}

  async execute(
    input: ListCustomersInput,
  ): Promise<PaginatedOutput<CustomerOutput>> {
    const { items, total } = await this.customers.list({
      page: input.page,
      limit: input.limit,
      status: input.status,
      search: input.search,
    });

    return {
      items: items.map(toCustomerOutput),
      total,
      page: input.page,
      limit: input.limit,
    };
  }
}
