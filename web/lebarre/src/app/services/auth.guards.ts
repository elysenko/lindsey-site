import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Blocks access to anything under `/admin` for unauthenticated users.
 * Redirects to `/admin/login`.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.signedIn()) return true;
  router.navigate(['/admin/login']);
  return false;
};

/**
 * Requires the ADMIN role on top of `authGuard`. Renders a 403 page for
 * authenticated non-admin users, leaving the URL intact so refreshing the
 * page reproduces the state cleanly.
 */
export const adminRoleGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.signedIn()) {
    router.navigate(['/admin/login']);
    return false;
  }
  if (auth.isAdmin()) return true;
  router.navigate(['/admin/forbidden']);
  return false;
};
