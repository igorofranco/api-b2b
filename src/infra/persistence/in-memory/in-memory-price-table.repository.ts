import type { PriceTable } from '../../../domain/entities/price-table.js';
import type { PriceTableRepository } from '../../../domain/repositories/price-table-repository.js';

export class InMemoryPriceTableRepository implements PriceTableRepository {
  private readonly priceTables = new Map<string, PriceTable>();

  async findById(id: string): Promise<PriceTable | null> {
    return this.priceTables.get(id) ?? null;
  }

  async save(priceTable: PriceTable): Promise<void> {
    this.priceTables.set(priceTable.id, priceTable);
  }
}
