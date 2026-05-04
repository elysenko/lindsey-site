import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { apiUrl } from './api-config';
import {
  AdminLeadDetailDto,
  AdminLeadNoteDto,
  AdminLeadsListQuery,
  AdminLeadsListResponse,
  BriefFieldKey,
  CreateNoteRequest,
  LeadStatusEnum,
  UpdateLeadRequest,
} from './api-types';
import { toApiError } from './http-error';

/** Wraps the `/api/admin/leads` endpoints. Cookie-auth is handled by the
 *  HTTP interceptor, which also redirects to /admin/login on 401. */
@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly http = inject(HttpClient);

  list(query: AdminLeadsListQuery = {}): Observable<AdminLeadsListResponse> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(query)) {
      if (v != null && v !== '') params = params.set(k, String(v));
    }
    return this.http
      .get<AdminLeadsListResponse>(apiUrl('/api/admin/leads'), { params })
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }

  get(id: string): Observable<AdminLeadDetailDto> {
    return this.http
      .get<AdminLeadDetailDto>(apiUrl(`/api/admin/leads/${encodeURIComponent(id)}`))
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }

  /**
   * Sends a partial PATCH. The backend writes audit rows for every brief
   * field that changes — we don't need to track previous values client-side.
   */
  update(id: string, payload: UpdateLeadRequest): Observable<{ ok: true }> {
    return this.http
      .patch<{ ok: true }>(
        apiUrl(`/api/admin/leads/${encodeURIComponent(id)}`),
        payload,
      )
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }

  updateStatus(id: string, status: LeadStatusEnum): Observable<{ ok: true }> {
    return this.update(id, { leadStatus: status });
  }

  updateBriefField(
    id: string,
    field: BriefFieldKey,
    value: string,
  ): Observable<{ ok: true }> {
    return this.update(id, { [field]: value } as UpdateLeadRequest);
  }

  addNote(id: string, body: string): Observable<AdminLeadNoteDto> {
    const payload: CreateNoteRequest = { body };
    return this.http
      .post<AdminLeadNoteDto>(
        apiUrl(`/api/admin/leads/${encodeURIComponent(id)}/notes`),
        payload,
      )
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }
}
