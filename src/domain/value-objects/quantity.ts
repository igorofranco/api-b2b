import { InvalidQuantityError } from '../errors/invalid-quantity.error.js';

export class Quantity {
  private constructor(readonly value: number) {}

  static create(raw: number): Quantity {
    if (!Number.isInteger(raw) || raw <= 0) {
      throw new InvalidQuantityError();
    }
    return new Quantity(raw);
  }

  plus(other: Quantity): Quantity {
    return Quantity.create(this.value + other.value);
  }

  isGreaterThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
