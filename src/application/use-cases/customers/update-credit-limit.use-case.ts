import { Injectable, Inject } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../../domain/repositories/customer-repository.js';
import { Money } from '../../../domain/value-objects/money.js';
import { NotFoundError } from '../../errors/application-errors.js';

export interface UpdateCreditLimitInput {
  customerId: string;
  creditLimitCents: number;
}

@Injectable()
export class UpdateCreditLimitUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
  ) {}

  async execute(input: UpdateCreditLimitInput): Promise<number> {
    const customer = await this.customers.findById(input.customerId);
    if (!customer) {
      throw new NotFoundError('Cliente', input.customerId);
    }

    customer.changeCreditLimit(Money.fromCents(input.creditLimitCents));
    await this.customers.save(customer);

    return customer.creditLimit.cents;
  }
}
