import { InvalidMoneyError } from '../errors/invalid-money.error.js';

export class Money {
  private constructor(readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new InvalidMoneyError(
        'O valor em centavos deve ser um inteiro não negativo.',
      );
    }
    return new Money(cents);
  }

  plus(other: Money): Money {
    return Money.fromCents(this.cents + other.cents);
  }

  times(quantity: number): Money {
    return Money.fromCents(this.cents * quantity);
  }

  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  get formatted(): string {
    return (this.cents / 100).toFixed(2);
  }
}
