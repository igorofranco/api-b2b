import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { UserMapper } from '../mappers.js';
import type { User } from '../../../../domain/entities/user.js';
import type { UserRepository } from '../../../../domain/repositories/user-repository.js';
import type { Email } from '../../../../domain/value-objects/email.js';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.value },
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async save(user: User): Promise<void> {
    const record = UserMapper.toRecord(user);
    await this.prisma.user.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        email: record.email,
        passwordHash: record.passwordHash,
        role: record.role,
        customerId: record.customerId,
        createdAt: record.createdAt,
      },
      update: {
        email: record.email,
        passwordHash: record.passwordHash,
        role: record.role,
        customerId: record.customerId,
      },
    });
  }
}
