import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { apiUrl } from './api-config';
import {
  BriefShellDto,
  UpsertBriefRequest,
  UpsertBriefResponse,
} from './api-types';
import { toApiError } from './http-error';

/**
 * Loads and submits the Brand Intelligence Brief by token.
 * The 404 path bubbles up as `ApiError { kind: 'not-found' }` so the brief
 * page can render the "token not valid" message.
 */
@Injectable({ providedIn: 'root' })
export class BrandBriefService {
  private readonly http = inject(HttpClient);

  load(token: string): Observable<BriefShellDto> {
    return this.http
      .get<BriefShellDto>(apiUrl(`/api/brief/${encodeURIComponent(token)}`))
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }

  submit(token: string, payload: UpsertBriefRequest): Observable<UpsertBriefResponse> {
    return this.http
      .post<UpsertBriefResponse>(
        apiUrl(`/api/brief/${encodeURIComponent(token)}`),
        payload,
      )
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }
}
