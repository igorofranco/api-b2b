import type { Customer } from '../../../domain/entities/customer.js';
import type {
  CustomerListParams,
  CustomerRepository,
} from '../../../domain/repositories/customer-repository.js';
import type { Paginated } from '../../../domain/repositories/pagination.js';
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

  async list(params: CustomerListParams): Promise<Paginated<Customer>> {
    const search = params.search?.trim().toLowerCase();
    const filtered = [...this.customers.values()].filter((customer) => {
      if (params.status !== undefined && customer.status !== params.status) {
        return false;
      }
      if (search) {
        const digits = search.replace(/\D/g, '');
        return (
          customer.name.toLowerCase().includes(search) ||
          (digits.length > 0 && customer.cnpj.value.includes(digits))
        );
      }
      return true;
    });

    return {
      items: filtered.slice(
        (params.page - 1) * params.limit,
        (params.page - 1) * params.limit + params.limit,
      ),
      total: filtered.length,
    };
  }

  async save(customer: Customer): Promise<void> {
    this.customers.set(customer.id, customer);
  }
}
