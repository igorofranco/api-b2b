import { DomainError } from './domain-error.js';

export class InvalidIdempotencyKeyError extends DomainError {
  constructor(message = 'Chave de idempotência inválida.') {
    super(message, 'INVALID_IDEMPOTENCY_KEY');
  }
}
