import type {
  IdempotencyIdentifier,
  IdempotencyStore,
} from '../../../domain/repositories/idempotency-store.js';

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly entries = new Map<string, string>();

  async find(identifier: IdempotencyIdentifier): Promise<string | null> {
    return this.entries.get(this.key(identifier)) ?? null;
  }

  async remember(
    identifier: IdempotencyIdentifier,
    orderId: string,
    _ttlSeconds: number,
  ): Promise<void> {
    this.entries.set(this.key(identifier), orderId);
  }

  private key(identifier: IdempotencyIdentifier): string {
    return `${identifier.customerId}:${identifier.key.value}`;
  }
}
