import type { PriceTable } from '../../../domain/entities/price-table.js';
import type { Paginated } from '../../../domain/repositories/pagination.js';
import type {
  PriceTableListParams,
  PriceTableRepository,
} from '../../../domain/repositories/price-table-repository.js';

export class InMemoryPriceTableRepository implements PriceTableRepository {
  private readonly priceTables = new Map<string, PriceTable>();

  async findById(id: string): Promise<PriceTable | null> {
    return this.priceTables.get(id) ?? null;
  }

  async list(params: PriceTableListParams): Promise<Paginated<PriceTable>> {
    const search = params.search?.trim().toLowerCase();
    const filtered = [...this.priceTables.values()].filter((priceTable) =>
      search ? priceTable.name.toLowerCase().includes(search) : true,
    );

    return {
      items: filtered.slice(
        (params.page - 1) * params.limit,
        (params.page - 1) * params.limit + params.limit,
      ),
      total: filtered.length,
    };
  }

  async save(priceTable: PriceTable): Promise<void> {
    this.priceTables.set(priceTable.id, priceTable);
  }
}
