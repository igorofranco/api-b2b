import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { ProductMapper } from '../mappers.js';
import type { Product } from '../../../../domain/entities/product.js';
import type { ProductRepository } from '../../../../domain/repositories/product-repository.js';
import type { Sku } from '../../../../domain/value-objects/sku.js';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return record ? ProductMapper.toDomain(record) : null;
  }

  async findByIds(ids: readonly string[]): Promise<Product[]> {
    if (ids.length === 0) {
      return [];
    }
    const records = await this.prisma.product.findMany({
      where: { id: { in: [...ids] } },
    });
    return records.map((record) => ProductMapper.toDomain(record));
  }

  async findBySku(sku: Sku): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({
      where: { sku: sku.value },
    });
    return record ? ProductMapper.toDomain(record) : null;
  }

  async save(product: Product): Promise<void> {
    const record = ProductMapper.toRecord(product);
    await this.prisma.product.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        sku: record.sku,
        name: record.name,
        description: record.description,
        unit: record.unit,
        basePrice: record.basePrice,
        status: record.status,
        createdAt: record.createdAt,
      },
      update: {
        name: record.name,
        description: record.description,
        unit: record.unit,
        basePrice: record.basePrice,
        status: record.status,
      },
    });
  }
}
