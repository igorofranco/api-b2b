import { DomainError } from './domain-error.js';

export class InvalidCustomerStatusError extends DomainError {
  constructor(message = 'Transição de status do cliente inválida.') {
    super(message, 'INVALID_CUSTOMER_STATUS');
  }
}
