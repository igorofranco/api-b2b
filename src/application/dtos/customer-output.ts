import type { CustomerStatus } from '../../domain/entities/customer.js';

export interface CustomerOutput {
  id: string;
  name: string;
  cnpj: string;
  status: CustomerStatus;
  creditLimitCents: number;
  priceTableId: string;
  createdAt: string;
  updatedAt: string;
}
