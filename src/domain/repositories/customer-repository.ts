import type { Customer } from '../entities/customer.js';
import type { Cnpj } from '../value-objects/cnpj.js';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByCnpj(cnpj: Cnpj): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
}
