import { InvalidIdempotencyKeyError } from '../errors/invalid-idempotency-key.error.js';

export class IdempotencyKey {
  private constructor(readonly value: string) {}

  static create(raw: string): IdempotencyKey {
    const value = raw.trim();

    if (value.length < 8 || value.length > 255) {
      throw new InvalidIdempotencyKeyError(
        'A chave de idempotência deve ter entre 8 e 255 caracteres.',
      );
    }

    return new IdempotencyKey(value);
  }

  equals(other: IdempotencyKey): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
