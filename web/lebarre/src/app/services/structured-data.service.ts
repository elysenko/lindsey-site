import { Injectable, inject } from '@angular/core';
import { JsonLdService } from './json-ld.service';

/**
 * Convenience wrapper that takes JSON-LD payloads returned by the backend
 * and injects them into the document head via JsonLdService. The backend
 * already builds Organization, Service, Article, FAQPage, BreadcrumbList,
 * and Person blobs alongside content responses (see
 * `backend/src/seo/jsonld.service.ts`); the UI only has to relay them.
 */
@Injectable({ providedIn: 'root' })
export class StructuredDataService {
  private readonly jsonLd = inject(JsonLdService);

  /**
   * Injects every payload that's present in `payloads`. Falsy entries are
   * dropped. Pass an array because the spec requires multiple JSON-LD blobs
   * per page (e.g. Service + FAQPage + BreadcrumbList).
   */
  set(payloads: Array<unknown | null | undefined>): void {
    const filtered = payloads.filter(Boolean);
    this.jsonLd.set(filtered as object[]);
  }

  clear(): void {
    this.jsonLd.set([]);
  }
}
