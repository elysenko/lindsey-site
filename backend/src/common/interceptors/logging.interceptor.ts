import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

/**
 * Structured request/response log line per request. We deliberately keep this
 * lightweight — admin endpoints are infrequent, and the public form endpoints
 * already have rate limits, so the volume is manageable. Bodies are not logged
 * (PII concern); only method, path, status, and duration.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = ctx.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const started = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const dur = Date.now() - started;
          this.logger.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${dur}ms`);
        },
        error: (err) => {
          const dur = Date.now() - started;
          this.logger.warn(
            `${req.method} ${req.originalUrl} -> ${err?.status ?? 500} ${dur}ms (${err?.message ?? 'error'})`,
          );
        },
      }),
    );
  }
}
