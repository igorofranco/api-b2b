import { DomainError } from './domain-error.js';

export class InvalidMoneyError extends DomainError {
  constructor(message = 'Valor monetário inválido.') {
    super(message, 'INVALID_MONEY');
  }
}
