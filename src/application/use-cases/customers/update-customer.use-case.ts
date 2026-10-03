import { Inject, Injectable } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../../domain/repositories/customer-repository.js';
import { Money } from '../../../domain/value-objects/money.js';
import { NotFoundError } from '../../errors/application-errors.js';
import type { CustomerOutput } from '../../dtos/customer-output.js';
import { toCustomerOutput } from './customer.mapper.js';

export interface UpdateCustomerInput {
  customerId: string;
  name?: string | undefined;
  creditLimitCents?: number | undefined;
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
  ) {}

  async execute(input: UpdateCustomerInput): Promise<CustomerOutput> {
    const customer = await this.customers.findById(input.customerId);
    if (!customer) {
      throw new NotFoundError('Cliente', input.customerId);
    }

    if (input.name !== undefined) {
      customer.rename(input.name);
    }
    if (input.creditLimitCents !== undefined) {
      customer.changeCreditLimit(Money.fromCents(input.creditLimitCents));
    }

    await this.customers.save(customer);

    return toCustomerOutput(customer);
  }
}
