import type { Customer } from '../../../domain/entities/customer.js';
import type { CustomerOutput } from '../../dtos/customer-output.js';

export function toCustomerOutput(customer: Customer): CustomerOutput {
  return {
    id: customer.id,
    name: customer.name,
    cnpj: customer.cnpj.value,
    status: customer.status,
    creditLimitCents: customer.creditLimit.cents,
    priceTableId: customer.priceTableId,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}
