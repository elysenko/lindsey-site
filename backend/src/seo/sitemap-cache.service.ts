import { Injectable } from '@nestjs/common';

/**
 * In-process invalidation flag for the rendered sitemap.
 *
 * The sitemap controller renders fresh XML on cache miss, then keeps the
 * result in memory for up to TTL_MS. Admin actions that change a published
 * URL (e.g. publishing/updating an Insights post) call invalidate() so the
 * next request re-renders.
 *
 * On a multi-replica deployment the worst case is one slightly-stale replica
 * for up to TTL_MS — acceptable for sitemap.xml. Replace with Redis
 * pub/sub if strict cross-replica coherence becomes important.
 */
@Injectable()
export class SitemapCacheService {
  private static readonly TTL_MS = 60_000; // 1 min default

  private cachedXml: string | null = null;
  private cachedAt = 0;

  get(): string | null {
    if (!this.cachedXml) return null;
    if (Date.now() - this.cachedAt > SitemapCacheService.TTL_MS) return null;
    return this.cachedXml;
  }

  set(xml: string): void {
    this.cachedXml = xml;
    this.cachedAt = Date.now();
  }

  invalidate(): void {
    this.cachedXml = null;
    this.cachedAt = 0;
  }
}
