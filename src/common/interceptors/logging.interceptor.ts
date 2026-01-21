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

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request;
    const correlationId = request.headers['x-correlation-id'];
    const now = Date.now();

    this.logger.log(
      `[${correlationId}] ${method} ${url} - Request started`,
    );

    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`[${correlationId}] Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - now;
          this.logger.log(
            `[${correlationId}] ${method} ${url} ${response.statusCode} - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `[${correlationId}] ${method} ${url} - ${duration}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}