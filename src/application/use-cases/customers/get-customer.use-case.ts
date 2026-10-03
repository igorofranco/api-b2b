import { Inject, Injectable } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../../domain/repositories/customer-repository.js';
import { NotFoundError } from '../../errors/application-errors.js';
import type { CustomerOutput } from '../../dtos/customer-output.js';
import { toCustomerOutput } from './customer.mapper.js';

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
  ) {}

  async execute(customerId: string): Promise<CustomerOutput> {
    const customer = await this.customers.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Cliente', customerId);
    }

    return toCustomerOutput(customer);
  }
}
