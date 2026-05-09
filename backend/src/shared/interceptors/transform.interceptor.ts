import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  success: boolean;
  data: T;
  meta?: any;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map(res => {
        // Se a resposta já vier encapsulada (ex: controllers que estipulam as próprias mensagens)
        if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
          return res;
        }

        // Identifica se o controller retornou um formato de paginação ({ data: [], meta: {} })
        const hasMeta = res && typeof res === 'object' && 'data' in res && 'meta' in res;
        const data = hasMeta ? res.data : res !== undefined ? res : null;
        const meta = hasMeta ? res.meta : undefined;

        return {
          success: true,
          message: 'Operation completed successfully',
          data,
          ...(meta !== undefined && { meta }),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
