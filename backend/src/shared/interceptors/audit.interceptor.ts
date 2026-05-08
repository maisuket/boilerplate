import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

const AUDITED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';

    if (!AUDITED_METHODS.includes(method)) {
      return next.handle();
    }

    const user = (request as any).user;

    return next.handle().pipe(
      tap({
        next: async () => {
          try {
            const urlParts = url.split('/').filter(Boolean);
            const resource = urlParts[1]?.toUpperCase() || 'UNKNOWN';
            const resourceId = urlParts[2] || undefined;

            await this.prisma.auditLog.create({
              data: {
                userId: user?.id || null,
                action: method,
                resource,
                resourceId,
                metadata: {
                  url,
                  body: this.sanitizeBody(request.body),
                },
                ipAddress: ip,
                userAgent,
              },
            });
          } catch (error) {
            this.logger.error('Failed to create audit log', error);
          }
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'refreshToken', 'accessToken'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    return sanitized;
  }
}
