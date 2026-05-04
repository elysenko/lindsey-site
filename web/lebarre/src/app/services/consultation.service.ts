import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { apiUrl } from './api-config';
import {
  CreateConsultationRequest,
  CreateConsultationResponse,
} from './api-types';
import { toApiError } from './http-error';

/**
 * Wraps `POST /api/consultations`. The server-side endpoint:
 *   - Returns `{ briefToken, redirectTo }` on success
 *   - 429 Too Many Requests when the IP exceeds 5 submissions/hour
 *   - 400/422 with class-validator messages on invalid input
 *
 * Errors are normalized into ApiError so the form component can render
 * inline messages without inspecting raw HTTP semantics.
 */
@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private readonly http = inject(HttpClient);

  submit(payload: CreateConsultationRequest): Observable<CreateConsultationResponse> {
    return this.http
      .post<CreateConsultationResponse>(apiUrl('/api/consultations'), payload)
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }
}
