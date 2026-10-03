import { Money } from '../value-objects/money.js';

export class CreditPolicy {
  static canConfirmDirectly(
    orderTotal: Money,
    openExposure: Money,
    creditLimit: Money,
  ): boolean {
    return orderTotal.plus(openExposure).cents <= creditLimit.cents;
  }

  static availableCredit(openExposure: Money, creditLimit: Money): Money {
    return Money.fromCents(Math.max(creditLimit.cents - openExposure.cents, 0));
  }
}
