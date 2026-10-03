import { DomainError } from './domain-error.js';

export class InvalidCnpjError extends DomainError {
  constructor(message = 'CNPJ inválido.') {
    super(message, 'INVALID_CNPJ');
  }
}
