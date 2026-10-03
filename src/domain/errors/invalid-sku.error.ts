import { DomainError } from './domain-error.js';

export class InvalidSkuError extends DomainError {
  constructor(message = 'SKU inválido.') {
    super(message, 'INVALID_SKU');
  }
}
