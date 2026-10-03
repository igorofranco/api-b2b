import type { Stock } from '../../../domain/entities/stock.js';
import type { StockRepository } from '../../../domain/repositories/stock-repository.js';

export class InMemoryStockRepository implements StockRepository {
  private readonly stocks = new Map<string, Stock>();

  async findByProductId(productId: string): Promise<Stock | null> {
    return this.stocks.get(productId) ?? null;
  }

  async findByProductIds(productIds: readonly string[]): Promise<Stock[]> {
    return productIds
      .map((productId) => this.stocks.get(productId))
      .filter((stock): stock is Stock => stock !== undefined);
  }

  async save(stock: Stock): Promise<void> {
    this.stocks.set(stock.productId, stock);
  }
}
