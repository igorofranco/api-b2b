import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from '../../../domain/errors/domain-error.js';

const DOMAIN_STATUS: Record<string, number> = {
  UNAUTHENTICATED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CNPJ_ALREADY_EXISTS: HttpStatus.CONFLICT,
  SKU_ALREADY_EXISTS: HttpStatus.CONFLICT,
  DUPLICATE_PRICE_TABLE_ITEM: HttpStatus.CONFLICT,
  INVALID_ORDER_STATE: HttpStatus.CONFLICT,
  IDEMPOTENCY_CONFLICT: HttpStatus.CONFLICT,
  CUSTOMER_INACTIVE: HttpStatus.UNPROCESSABLE_ENTITY,
  PRODUCT_INACTIVE: HttpStatus.UNPROCESSABLE_ENTITY,
  INSUFFICIENT_CREDIT: HttpStatus.UNPROCESSABLE_ENTITY,
  INSUFFICIENT_STOCK: HttpStatus.UNPROCESSABLE_ENTITY,
};

const STATUS_PHRASE: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
};

const STATUS_CODE: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  500: 'INTERNAL_ERROR',
};

interface ErrorBody {
  statusCode: number;
  error: string;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  path: string;
  timestamp: string;
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<{ url: string }>();
    const body = this.resolve(exception, request.url);

    response.status(body.statusCode).json(body);
  }

  private resolve(exception: unknown, path: string): ErrorBody {
    if (exception instanceof DomainError) {
      const statusCode =
        DOMAIN_STATUS[exception.code] ?? HttpStatus.UNPROCESSABLE_ENTITY;
      const details = this.extractDetails(exception);

      return {
        statusCode,
        error: STATUS_PHRASE[statusCode] ?? 'Unprocessable Entity',
        code: exception.code,
        message: exception.message,
        ...(details ? { details } : {}),
        path,
        timestamp: new Date().toISOString(),
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const httpResponse = exception.getResponse();
      const payload =
        typeof httpResponse === 'string'
          ? { message: httpResponse }
          : (httpResponse as Record<string, unknown>);

      const message = this.normalizeMessage(payload.message);
      const code =
        typeof payload.code === 'string'
          ? payload.code
          : (STATUS_CODE[statusCode] ?? 'HTTP_ERROR');

      return {
        statusCode,
        error: STATUS_PHRASE[statusCode] ?? exception.name,
        code,
        message,
        path,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: STATUS_PHRASE[500]!,
      code: STATUS_CODE[500]!,
      message: 'Erro interno inesperado.',
      path,
      timestamp: new Date().toISOString(),
    };
  }

  private normalizeMessage(message: unknown): string {
    if (Array.isArray(message)) {
      return message.join('; ');
    }
    if (typeof message === 'string') {
      return message;
    }
    return 'Requisição inválida.';
  }

  private extractDetails(
    error: DomainError,
  ): Record<string, unknown> | undefined {
    const candidates = error as unknown as Record<string, unknown>;
    const details: Record<string, unknown> = {};

    for (const key of ['creditLimitCents', 'exposureCents']) {
      if (typeof candidates[key] === 'number') {
        details[key] = candidates[key];
      }
    }

    return Object.keys(details).length > 0 ? details : undefined;
  }
}
