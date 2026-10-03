import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { OrderMapper } from '../mappers.js';
import type { Order } from '../../../../domain/entities/order.js';
import type { OrderRepository } from '../../../../domain/repositories/order-repository.js';

const INCLUDE_ITEMS = { items: true } as const;
const OPEN_STATUSES = ['PENDING_APPROVAL'] as const;

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { id },
      include: INCLUDE_ITEMS,
    });
    return record ? OrderMapper.toDomain(record) : null;
  }

  async findByIdempotencyKey(
    customerId: string,
    idempotencyKey: string,
  ): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { customerId_idempotencyKey: { customerId, idempotencyKey } },
      include: INCLUDE_ITEMS,
    });
    return record ? OrderMapper.toDomain(record) : null;
  }

  async findOpenByCustomer(customerId: string): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: { customerId, status: { in: [...OPEN_STATUSES] } },
      include: INCLUDE_ITEMS,
    });
    return records.map((record) => OrderMapper.toDomain(record));
  }

  async save(order: Order): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.order.upsert({
        where: { id: order.id },
        create: {
          id: order.id,
          customerId: order.customerId,
          status: order.status,
          total: order.total.cents,
          idempotencyKey: order.idempotencyKey.value,
          createdAt: order.createdAt,
        },
        update: {
          status: order.status,
          total: order.total.cents,
        },
      });

      await transaction.orderItem.deleteMany({ where: { orderId: order.id } });
      await transaction.orderItem.createMany({
        data: order.items.map((item) => ({
          id: item.id,
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity.value,
          unitPrice: item.unitPrice.cents,
          subtotal: item.subtotal.cents,
        })),
      });
    });
  }
}
