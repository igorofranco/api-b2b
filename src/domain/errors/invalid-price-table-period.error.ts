import { DomainError } from './domain-error.js';

export class InvalidPriceTablePeriodError extends DomainError {
  constructor(message = 'A vigência final não pode ser anterior à inicial.') {
    super(message, 'INVALID_PRICE_TABLE_PERIOD');
  }
}
