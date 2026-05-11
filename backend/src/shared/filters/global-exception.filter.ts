import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const requestId = (request.headers['x-request-id'] as string) || 'system-generated-id';
    const path = request.url;
    const timestamp = new Date().toISOString();

    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as any;
      message = exception.message;

      if (typeof exceptionResponse === 'object') {
        // Trata os erros de validação gerados pelo class-validator
        if (Array.isArray(exceptionResponse.message)) {
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
          details = exceptionResponse.message;
        } else {
          message = exceptionResponse.message || message;
          code = exceptionResponse.error
            ? exceptionResponse.error.toUpperCase().replace(/\s+/g, '_')
            : this.getDefaultCode(status);
          details = exceptionResponse.details || null;
        }
      } else {
        code = this.getDefaultCode(status);
      }
    } else if (process.env.NODE_ENV !== 'production') {
      // Em desenvolvimento, expomos o erro real para facilitar o debug de erros inesperados (500)
      message = exception instanceof Error ? exception.message : 'Unknown error';
      details = exception instanceof Error ? exception.stack : null;
    }

    const errorResponse = {
      success: false,
      message,
      error: {
        code,
        details,
      },
      requestId,
      timestamp,
      path,
    };

    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} - Status: ${status} - Error: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }

  private getDefaultCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
