import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { apiUrl } from './api-config';
import {
  AuthUserDto,
  LoginRequest,
  LoginResponse,
  UserRoleEnum,
} from './api-types';

const SESSION_USER_KEY = 'lebarre.adminUser';

/**
 * Admin authentication.
 *
 * The backend issues an HTTP-only cookie (`lebarre_admin_session`) on
 * `POST /api/admin/auth/login`, and we never see the JWT directly. We mirror
 * a small subset of the user record into sessionStorage so that the
 * AuthGuard can decide synchronously whether to allow navigation; the
 * backend is the source of truth for *whether* the cookie is still valid
 * (it will return 401 if not, and the HTTP interceptor will clear our
 * mirror).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<AuthUserDto | null>(this.loadCachedUser());

  readonly user = this._user.asReadonly();
  readonly signedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly email = computed(() => this._user()?.email ?? null);

  /** Synchronous role check used by AdminRoleGuard. */
  hasRole(role: UserRoleEnum): boolean {
    return this._user()?.role === role;
  }

  login(payload: LoginRequest): Observable<AuthUserDto> {
    return this.http
      .post<LoginResponse>(apiUrl('/api/admin/auth/login'), payload, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.user),
        tap((u) => this.setUser(u)),
        catchError((err: HttpErrorResponse) => throwError(() => err)),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(
        apiUrl('/api/admin/auth/logout'),
        {},
        { withCredentials: true },
      )
      .pipe(
        tap(() => this.clearSession()),
        // Clear local mirror even if the network call fails — the cookie may
        // already be gone or the user may be offline.
        catchError(() => {
          this.clearSession();
          return of(void 0);
        }),
      );
  }

  /**
   * Returns the cached user immediately. Components that need a fresh
   * server-side validation can subscribe to whatever the interceptor does
   * on 401.
   */
  currentUser(): AuthUserDto | null {
    return this._user();
  }

  /** Wipe local session state (called by the HTTP interceptor on 401). */
  clearSession(): void {
    this._user.set(null);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_USER_KEY);
    }
  }

  private setUser(user: AuthUserDto): void {
    this._user.set(user);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    }
  }

  private loadCachedUser(): AuthUserDto | null {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUserDto;
    } catch {
      sessionStorage.removeItem(SESSION_USER_KEY);
      return null;
    }
  }
}
