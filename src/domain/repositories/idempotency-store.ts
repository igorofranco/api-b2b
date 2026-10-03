import type { IdempotencyKey } from '../value-objects/idempotency-key.js';

export const IDEMPOTENCY_STORE = Symbol('IDEMPOTENCY_STORE');

export interface IdempotencyIdentifier {
  readonly customerId: string;
  readonly key: IdempotencyKey;
}

export interface IdempotencyStore {
  find(identifier: IdempotencyIdentifier): Promise<string | null>;
  remember(
    identifier: IdempotencyIdentifier,
    orderId: string,
    ttlSeconds: number,
  ): Promise<void>;
}
