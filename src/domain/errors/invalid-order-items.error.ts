import { DomainError } from './domain-error.js';

export class InvalidOrderItemsError extends DomainError {
  constructor(
    message = 'O pedido precisa de pelo menos um item com quantidade válida.',
  ) {
    super(message, 'INVALID_ORDER_ITEMS');
  }
}
