import type { Customer } from '../../../domain/entities/customer.js';
import type { CustomerRepository } from '../../../domain/repositories/customer-repository.js';
import type { Cnpj } from '../../../domain/value-objects/cnpj.js';

export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers = new Map<string, Customer>();

  async findById(id: string): Promise<Customer | null> {
    return this.customers.get(id) ?? null;
  }

  async findByCnpj(cnpj: Cnpj): Promise<Customer | null> {
    for (const customer of this.customers.values()) {
      if (customer.cnpj.equals(cnpj)) {
        return customer;
      }
    }
    return null;
  }

  async save(customer: Customer): Promise<void> {
    this.customers.set(customer.id, customer);
  }
}
