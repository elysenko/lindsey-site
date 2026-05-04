import { environment } from '../../environments/environment';

/**
 * Builds an absolute URL onto the NestJS API. Endpoints inside the codebase
 * pass paths starting with `/api/...`. When the SPA and API share the same
 * origin (the common production deployment), `apiBaseUrl` is empty and the
 * browser issues same-origin requests; when they differ (e.g. dev proxy
 * disabled), set `NG_APP_API_BASE_URL` style env values via the build.
 */
export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return (environment.apiBaseUrl || '') + path;
}
