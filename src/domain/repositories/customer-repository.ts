import type { Customer, CustomerStatus } from '../entities/customer.js';
import type { Cnpj } from '../value-objects/cnpj.js';
import type { Paginated, PaginationParams } from './pagination.js';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerListParams extends PaginationParams {
  status?: CustomerStatus | undefined;
  search?: string | undefined;
}

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByCnpj(cnpj: Cnpj): Promise<Customer | null>;
  list(params: CustomerListParams): Promise<Paginated<Customer>>;
  save(customer: Customer): Promise<void>;
}
