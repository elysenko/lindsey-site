import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from './api-types';

/**
 * Typed error wrapper that the API services emit to UI components. The
 * `kind` discriminator lets templates render specific states (rate-limited,
 * not found, validation failure) without inspecting raw HTTP semantics.
 */
export type ApiErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'rate-limited'
  | 'server'
  | 'network'
  | 'unknown';

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    public readonly status: number,
    message: string,
    public readonly fieldErrors: Record<string, string[]> = {},
    public readonly retryAfterSec?: number,
    public readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (!(err instanceof HttpErrorResponse)) {
    return new ApiError('unknown', 0, 'Unexpected error.', {}, undefined, err);
  }

  // Network failure (status === 0 in browsers when CORS or offline).
  if (err.status === 0) {
    return new ApiError(
      'network',
      0,
      'We could not reach the server. Please check your connection and try again.',
      {},
      undefined,
      err.error,
    );
  }

  const body = (err.error ?? {}) as ApiErrorBody;
  const messageRaw = body.message;
  const message = Array.isArray(messageRaw)
    ? messageRaw.join(' ')
    : typeof messageRaw === 'string'
      ? messageRaw
      : err.statusText || 'Request failed.';

  const fieldErrors = parseFieldErrors(messageRaw);

  switch (err.status) {
    case 400:
    case 422:
      return new ApiError('validation', err.status, message, fieldErrors, undefined, body);
    case 401:
      return new ApiError('unauthorized', err.status, message, fieldErrors, undefined, body);
    case 403:
      return new ApiError('forbidden', err.status, message, fieldErrors, undefined, body);
    case 404:
      return new ApiError('not-found', err.status, message, fieldErrors, undefined, body);
    case 429:
      return new ApiError(
        'rate-limited',
        err.status,
        message,
        fieldErrors,
        body.retryAfterSec,
        body,
      );
    default:
      if (err.status >= 500) {
        return new ApiError('server', err.status, message, fieldErrors, undefined, body);
      }
      return new ApiError('unknown', err.status, message, fieldErrors, undefined, body);
  }
}

/**
 * NestJS class-validator returns `message` as `string[]` of human strings
 * like `"organization must be longer than or equal to 1 characters"`. We
 * try to derive a per-field key by reading the leading word — good enough
 * for the form components to render inline errors.
 */
function parseFieldErrors(message: unknown): Record<string, string[]> {
  if (!Array.isArray(message)) return {};
  const out: Record<string, string[]> = {};
  for (const m of message) {
    if (typeof m !== 'string') continue;
    const match = m.match(/^([a-zA-Z]+)\b/);
    const key = match ? match[1] : '_';
    out[key] = [...(out[key] ?? []), m];
  }
  return out;
}
