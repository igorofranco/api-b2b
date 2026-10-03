import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CustomerMapper } from '../mappers.js';
import type { Customer } from '../../../../domain/entities/customer.js';
import type { CustomerRepository } from '../../../../domain/repositories/customer-repository.js';
import type { Cnpj } from '../../../../domain/value-objects/cnpj.js';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({ where: { id } });
    return record ? CustomerMapper.toDomain(record) : null;
  }

  async findByCnpj(cnpj: Cnpj): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({
      where: { cnpj: cnpj.value },
    });
    return record ? CustomerMapper.toDomain(record) : null;
  }

  async save(customer: Customer): Promise<void> {
    const record = CustomerMapper.toRecord(customer);
    await this.prisma.customer.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        name: record.name,
        cnpj: record.cnpj,
        status: record.status,
        creditLimit: record.creditLimit,
        priceTableId: record.priceTableId,
        createdAt: record.createdAt,
      },
      update: {
        name: record.name,
        status: record.status,
        creditLimit: record.creditLimit,
        priceTableId: record.priceTableId,
      },
    });
  }
}
