import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: boolean;
  message: string;
  data: null;
  timestamp: string;
  error: {
    statusCode: number;
    details: string | string[];
    error: string;
    path: string;
    method: string;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        message = res.message || exception.message;
        error = res.error || exception.name;
      } else {
        message = exceptionResponse as string;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;

      // Log unhandled errors
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    const extractedMessage = Array.isArray(message) ? message[0] : message;

    const errorResponse: ErrorResponse = {
      success: false,
      message: extractedMessage,
      data: null,
      timestamp: new Date().toISOString(),
      error: {
        statusCode: status,
        details: message,
        error,
        path: request.url,
        method: request.method,
      },
    };

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status}: ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status}: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
