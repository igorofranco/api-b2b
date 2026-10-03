import { Stock } from '../entities/stock.js';
import { Quantity } from '../value-objects/quantity.js';

export interface StockRequirement {
  stock: Stock;
  quantity: Quantity;
}

export class StockReservationService {
  static canReserveAll(requirements: readonly StockRequirement[]): boolean {
    const byProduct = new Map<string, number>();

    for (const requirement of requirements) {
      const requested = requirement.quantity.value;
      const committed =
        (byProduct.get(requirement.stock.productId) ?? 0) + requested;

      if (committed > requirement.stock.available) {
        return false;
      }
      byProduct.set(requirement.stock.productId, committed);
    }

    return true;
  }
}
