import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Functional HTTP interceptor (Angular 19 style).
 *
 * - Always attaches `withCredentials: true` so the admin cookie is sent on
 *   admin requests and CORS preflight allows the cookie. Public endpoints
 *   ignore the cookie, so this is harmless on `/api/consultations`,
 *   `/api/services`, etc.
 * - On 401 from any admin endpoint: clear the local session mirror and
 *   redirect to `/admin/login`. We do NOT redirect on public 401s — those
 *   shouldn't happen, but if they do we let the page handle it.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Same-origin admin requests get credentials and a JSON content type when
  // a body is present. We don't override existing headers (some uploads use
  // multipart) — only set defaults.
  const cloned = req.clone({
    withCredentials: true,
    setHeaders: req.body && !(req.body instanceof FormData)
      ? { 'Content-Type': 'application/json', Accept: 'application/json' }
      : { Accept: 'application/json' },
  });

  return next(cloned).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse) {
        const isAdminRoute = req.url.includes('/api/admin');
        if (err.status === 401 && isAdminRoute) {
          auth.clearSession();
          // Avoid an infinite redirect loop while the login POST itself 401s.
          if (!req.url.includes('/api/admin/auth/login')) {
            router.navigate(['/admin/login']);
          }
        }
      }
      return throwError(() => err);
    }),
  );
};
