import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { PriceTableMapper } from '../mappers.js';
import type { PriceTable } from '../../../../domain/entities/price-table.js';
import type {
  PriceTableListParams,
  PriceTableRepository,
} from '../../../../domain/repositories/price-table-repository.js';
import type { Paginated } from '../../../../domain/repositories/pagination.js';

@Injectable()
export class PrismaPriceTableRepository implements PriceTableRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PriceTable | null> {
    const record = await this.prisma.priceTable.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!record) {
      return null;
    }

    return PriceTableMapper.toDomain({
      id: record.id,
      name: record.name,
      currency: record.currency,
      validFrom: record.validFrom,
      validTo: record.validTo,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      items: record.items.map((item) => ({
        productId: item.productId,
        price: item.price,
      })),
    });
  }

  async list(params: PriceTableListParams): Promise<Paginated<PriceTable>> {
    const search = params.search?.trim();
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [records, total] = await this.prisma.$transaction([
      this.prisma.priceTable.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'asc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.priceTable.count({ where }),
    ]);

    return {
      items: records.map((record) =>
        PriceTableMapper.toDomain({
          id: record.id,
          name: record.name,
          currency: record.currency,
          validFrom: record.validFrom,
          validTo: record.validTo,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          items: record.items.map((item) => ({
            productId: item.productId,
            price: item.price,
          })),
        }),
      ),
      total,
    };
  }

  async save(priceTable: PriceTable): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.priceTable.upsert({
        where: { id: priceTable.id },
        create: {
          id: priceTable.id,
          name: priceTable.name,
          currency: priceTable.currency,
          validFrom: priceTable.validFrom,
          validTo: priceTable.validTo,
          createdAt: priceTable.createdAt,
        },
        update: {
          name: priceTable.name,
          currency: priceTable.currency,
          validFrom: priceTable.validFrom,
          validTo: priceTable.validTo,
        },
      });

      await transaction.priceTableItem.deleteMany({
        where: { priceTableId: priceTable.id },
      });
      await transaction.priceTableItem.createMany({
        data: priceTable.items.map((item) => ({
          priceTableId: priceTable.id,
          productId: item.productId,
          price: item.price.cents,
        })),
      });
    });
  }
}
