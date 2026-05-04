import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { SitemapCacheService } from './sitemap-cache.service';

/**
 * Dynamic /sitemap.xml.
 *
 * Listed routes:
 *   - / (homepage)
 *   - /services + each /services/:slug for active services
 *   - /about
 *   - /team/:slug for each active team member
 *   - /faq
 *   - /insights + each /insights/:slug for status=PUBLISHED posts
 *   - /consult
 *
 * `lastmod` is sourced from the most relevant timestamp:
 *   - Insights: publishedAt / lastUpdatedAt
 *   - Services / team / faq: row updatedAt
 *   - Static: build-time fallback (server start time)
 */
@Controller()
export class SitemapController {
  private readonly serverStartIso = new Date().toISOString();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: SitemapCacheService,
  ) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async render(@Res({ passthrough: true }) res: Response): Promise<string> {
    const cached = this.cache.get();
    if (cached) return cached;

    const origin = (process.env.PUBLIC_SITE_ORIGIN ?? 'https://lebarregroup.com').replace(/\/$/, '');
    const url = (path: string) => `${origin}${path.startsWith('/') ? path : `/${path}`}`;

    const [services, teamMembers, posts] = await Promise.all([
      this.prisma.service.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.teamMember.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.insightsPost.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, lastUpdatedAt: true, publishedAt: true },
      }),
    ]);

    type Entry = { loc: string; lastmod: string; changefreq: string };
    const entries: Entry[] = [];

    entries.push({ loc: url('/'), lastmod: this.serverStartIso, changefreq: 'weekly' });
    entries.push({ loc: url('/services'), lastmod: this.serverStartIso, changefreq: 'monthly' });
    for (const s of services) {
      entries.push({
        loc: url(`/services/${s.slug}`),
        lastmod: s.updatedAt.toISOString(),
        changefreq: 'monthly',
      });
    }
    entries.push({ loc: url('/about'), lastmod: this.serverStartIso, changefreq: 'monthly' });
    for (const m of teamMembers) {
      entries.push({
        loc: url(`/team/${m.slug}`),
        lastmod: m.updatedAt.toISOString(),
        changefreq: 'yearly',
      });
    }
    entries.push({ loc: url('/faq'), lastmod: this.serverStartIso, changefreq: 'monthly' });
    entries.push({ loc: url('/insights'), lastmod: this.serverStartIso, changefreq: 'weekly' });
    for (const p of posts) {
      const last = (p.lastUpdatedAt ?? p.publishedAt ?? new Date()).toISOString();
      entries.push({
        loc: url(`/insights/${p.slug}`),
        lastmod: last,
        changefreq: 'monthly',
      });
    }
    entries.push({ loc: url('/consult'), lastmod: this.serverStartIso, changefreq: 'monthly' });

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      entries
        .map(
          (e) =>
            `  <url>\n    <loc>${escapeXml(e.loc)}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n  </url>`,
        )
        .join('\n') +
      `\n</urlset>\n`;

    this.cache.set(xml);
    return xml;
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
