import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { StockMapper } from '../mappers.js';
import type { Stock } from '../../../../domain/entities/stock.js';
import type { StockRepository } from '../../../../domain/repositories/stock-repository.js';

@Injectable()
export class PrismaStockRepository implements StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: string): Promise<Stock | null> {
    const record = await this.prisma.stock.findUnique({ where: { productId } });
    return record ? StockMapper.toDomain(record) : null;
  }

  async findByProductIds(productIds: readonly string[]): Promise<Stock[]> {
    if (productIds.length === 0) {
      return [];
    }
    const records = await this.prisma.stock.findMany({
      where: { productId: { in: [...productIds] } },
    });
    return records.map((record) => StockMapper.toDomain(record));
  }

  async save(stock: Stock): Promise<void> {
    await this.prisma.stock.upsert({
      where: { productId: stock.productId },
      create: {
        id: stock.id,
        productId: stock.productId,
        quantityOnHand: stock.quantityOnHand,
        quantityReserved: stock.quantityReserved,
      },
      update: {
        quantityOnHand: stock.quantityOnHand,
        quantityReserved: stock.quantityReserved,
      },
    });
  }
}
