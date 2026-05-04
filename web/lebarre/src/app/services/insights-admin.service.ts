import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { apiUrl } from './api-config';
import {
  AdminInsightUpsertRequest,
  InsightDetailDto,
  InsightDetailResponse,
  InsightsListResponse,
} from './api-types';
import { toApiError } from './http-error';

/**
 * Admin-side Insights CRUD.
 *
 * Note: the backend exposes admin write endpoints (POST/PATCH) but reuses the
 * public list/detail endpoints for read. The admin table needs DRAFT posts as
 * well as PUBLISHED ones — until the backend ships a separate admin list, we
 * use the public list (PUBLISHED only). When DRAFTs need to surface in the
 * admin UI, swap in a dedicated admin endpoint here.
 */
@Injectable({ providedIn: 'root' })
export class InsightsAdminService {
  private readonly http = inject(HttpClient);

  list(): Observable<InsightsListResponse> {
    return this.http
      .get<InsightsListResponse>(apiUrl('/api/insights'))
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }

  getBySlug(slug: string): Observable<InsightDetailResponse> {
    return this.http
      .get<InsightDetailResponse>(apiUrl(`/api/insights/${encodeURIComponent(slug)}`))
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }

  create(payload: AdminInsightUpsertRequest): Observable<InsightDetailDto> {
    return this.http
      .post<InsightDetailDto>(apiUrl('/api/admin/insights'), payload)
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }

  update(id: string, payload: AdminInsightUpsertRequest): Observable<InsightDetailDto> {
    return this.http
      .patch<InsightDetailDto>(
        apiUrl(`/api/admin/insights/${encodeURIComponent(id)}`),
        payload,
      )
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }
}
