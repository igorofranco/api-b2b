import type { PriceTable } from '../../../domain/entities/price-table.js';
import type { PriceTableOutput } from '../../dtos/price-table-output.js';

export function toPriceTableOutput(priceTable: PriceTable): PriceTableOutput {
  return {
    id: priceTable.id,
    name: priceTable.name,
    currency: priceTable.currency,
    validFrom: priceTable.validFrom.toISOString(),
    validTo: priceTable.validTo?.toISOString() ?? null,
    items: priceTable.items.map((item) => ({
      productId: item.productId,
      priceCents: item.price.cents,
    })),
    createdAt: priceTable.createdAt.toISOString(),
    updatedAt: priceTable.updatedAt.toISOString(),
  };
}
