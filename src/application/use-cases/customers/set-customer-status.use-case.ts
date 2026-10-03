import { Injectable, Inject } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../../domain/repositories/customer-repository.js';
import { NotFoundError } from '../../errors/application-errors.js';

export interface SetCustomerStatusInput {
  customerId: string;
  status: 'ACTIVE' | 'INACTIVE';
}

@Injectable()
export class SetCustomerStatusUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
  ) {}

  async execute(input: SetCustomerStatusInput): Promise<void> {
    const customer = await this.customers.findById(input.customerId);
    if (!customer) {
      throw new NotFoundError('Cliente', input.customerId);
    }

    if (input.status === 'ACTIVE') {
      customer.activate();
    } else {
      customer.deactivate();
    }

    await this.customers.save(customer);
  }
}
