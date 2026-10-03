import { DomainError } from '../../domain/errors/domain-error.js';

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(`${resource} não encontrado: ${id}.`, 'NOT_FOUND');
  }
}

export class CustomerInactiveError extends DomainError {
  constructor() {
    super(
      'O cliente está inativo e não pode realizar pedidos.',
      'CUSTOMER_INACTIVE',
    );
  }
}

export class ProductInactiveError extends DomainError {
  constructor(productId: string) {
    super(`O produto ${productId} está inativo.`, 'PRODUCT_INACTIVE');
  }
}

export class InsufficientCreditError extends DomainError {
  constructor(
    readonly creditLimitCents: number,
    readonly exposureCents: number,
  ) {
    super(
      'O pedido excede o limite de crédito disponível do cliente.',
      'INSUFFICIENT_CREDIT',
    );
  }
}

export class OrderNotApprovableError extends DomainError {
  constructor(orderId: string) {
    super(
      `O pedido ${orderId} não está pendente de aprovação.`,
      'INVALID_ORDER_STATE',
    );
  }
}

export class OrderNotCancellableError extends DomainError {
  constructor(orderId: string) {
    super(`O pedido ${orderId} não pode ser cancelado.`, 'INVALID_ORDER_STATE');
  }
}

export class OrderTotalMismatchError extends DomainError {
  constructor(expected: number, received: number) {
    super(
      `O total informado (${received}) não confere com o calculado (${expected}).`,
      'ORDER_TOTAL_MISMATCH',
    );
  }
}

export class DuplicateItemError extends DomainError {
  constructor(productId: string) {
    super(
      `O produto ${productId} aparece mais de uma vez no pedido.`,
      'INVALID_ORDER_ITEMS',
    );
  }
}
