import { Injectable, Inject } from '@nestjs/common';
import { Customer } from '../../../domain/entities/customer.js';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../../domain/repositories/customer-repository.js';
import {
  PRICE_TABLE_REPOSITORY,
  type PriceTableRepository,
} from '../../../domain/repositories/price-table-repository.js';
import { Money } from '../../../domain/value-objects/money.js';
import { Cnpj } from '../../../domain/value-objects/cnpj.js';
import { DomainError } from '../../../domain/errors/domain-error.js';
import { NotFoundError } from '../../errors/application-errors.js';
import { ID_GENERATOR, type IdGenerator } from '../../ports/id-generator.js';
import type { CustomerOutput } from '../../dtos/customer-output.js';
import { toCustomerOutput } from './customer.mapper.js';

export interface CreateCustomerInput {
  name: string;
  cnpj: string;
  creditLimitCents: number;
  priceTableId: string;
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
    @Inject(PRICE_TABLE_REPOSITORY)
    private readonly priceTables: PriceTableRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute(input: CreateCustomerInput): Promise<CustomerOutput> {
    const cnpj = Cnpj.create(input.cnpj);

    if (await this.customers.findByCnpj(cnpj)) {
      throw new DomainError(
        'Já existe um cliente com esse CNPJ.',
        'CNPJ_ALREADY_EXISTS',
      );
    }

    const priceTable = await this.priceTables.findById(input.priceTableId);
    if (!priceTable) {
      throw new NotFoundError('Tabela de preço', input.priceTableId);
    }

    const customer = Customer.create({
      id: this.ids.generate(),
      name: input.name,
      cnpj,
      creditLimit: Money.fromCents(input.creditLimitCents),
      priceTableId: input.priceTableId,
    });

    await this.customers.save(customer);

    return toCustomerOutput(customer);
  }
}
