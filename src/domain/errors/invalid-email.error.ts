import { DomainError } from './domain-error.js';

export class InvalidEmailError extends DomainError {
  constructor(message = 'E-mail inválido.') {
    super(message, 'INVALID_EMAIL');
  }
}
