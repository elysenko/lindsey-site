import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { apiUrl } from './api-config';
import {
  InsightDetailResponse,
  InsightsListResponse,
  ServiceDetailResponse,
  ServicesListResponse,
  SiteFaqGroupsResponse,
  TeamMemberDetailResponse,
  TeamMemberSummaryDto,
} from './api-types';
import { toApiError } from './http-error';

/**
 * One service per public content surface, grouped here for ergonomics. The
 * components could equally inject several smaller services — the tree-shaken
 * methods are identical in either case.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  // ---------- Services ----------
  listServices(): Observable<ServicesListResponse> {
    return this.http
      .get<ServicesListResponse>(apiUrl('/api/services'))
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }
  getService(slug: string): Observable<ServiceDetailResponse> {
    return this.http
      .get<ServiceDetailResponse>(apiUrl(`/api/services/${encodeURIComponent(slug)}`))
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }

  // ---------- Team ----------
  listTeam(): Observable<TeamMemberSummaryDto[]> {
    return this.http
      .get<TeamMemberSummaryDto[]>(apiUrl('/api/team'))
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }
  getTeamMember(slug: string): Observable<TeamMemberDetailResponse> {
    return this.http
      .get<TeamMemberDetailResponse>(apiUrl(`/api/team/${encodeURIComponent(slug)}`))
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }

  // ---------- FAQ ----------
  listFaq(): Observable<SiteFaqGroupsResponse> {
    return this.http
      .get<SiteFaqGroupsResponse>(apiUrl('/api/faq'))
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }

  // ---------- Insights ----------
  listInsights(page = 1, pageSize = 12): Observable<InsightsListResponse> {
    return this.http
      .get<InsightsListResponse>(apiUrl('/api/insights'), {
        params: { page: String(page), pageSize: String(pageSize) },
      })
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }
  getInsight(slug: string): Observable<InsightDetailResponse> {
    return this.http
      .get<InsightDetailResponse>(apiUrl(`/api/insights/${encodeURIComponent(slug)}`))
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }
}
