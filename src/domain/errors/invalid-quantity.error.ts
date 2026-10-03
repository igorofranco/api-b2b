import { DomainError } from './domain-error.js';

export class InvalidQuantityError extends DomainError {
  constructor(message = 'Quantidade deve ser um inteiro maior que zero.') {
    super(message, 'INVALID_QUANTITY');
  }
}
