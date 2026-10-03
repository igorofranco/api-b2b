import { InvalidSkuError } from '../errors/invalid-sku.error.js';

export class Sku {
  private constructor(readonly value: string) {}

  static create(raw: string): Sku {
    const value = raw.trim().toUpperCase().replace(/\s+/g, '-');

    if (!/^[A-Z0-9][A-Z0-9-]{1,31}$/.test(value)) {
      throw new InvalidSkuError(
        'O SKU deve ter de 2 a 32 caracteres, usando letras, números e hífen.',
      );
    }

    return new Sku(value);
  }

  equals(other: Sku): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
