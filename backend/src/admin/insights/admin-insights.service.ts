import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SitemapCacheService } from '../../seo/sitemap-cache.service';
import {
  CreateInsightDto,
  MIN_PUBLISHED_WORDS,
  UpdateInsightDto,
  wordCount,
} from './dto/upsert-insight.dto';

@Injectable()
export class AdminInsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sitemapCache: SitemapCacheService,
  ) {}

  async create(dto: CreateInsightDto) {
    if (dto.status === 'PUBLISHED' && wordCount(dto.body) < MIN_PUBLISHED_WORDS) {
      throw new BadRequestException(
        `Published posts must contain at least ${MIN_PUBLISHED_WORDS} words.`,
      );
    }
    const author = await this.prisma.teamMember.findUnique({
      where: { id: dto.authorTeamMemberId },
      select: { id: true },
    });
    if (!author) throw new BadRequestException('Author team member not found');

    const now = new Date();
    const post = await this.prisma.insightsPost.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        excerpt: dto.excerpt,
        body: dto.body,
        heroImageUrl: dto.heroImageUrl ?? null,
        authorTeamMemberId: author.id,
        status: dto.status ?? 'DRAFT',
        publishedAt: dto.status === 'PUBLISHED' ? new Date(dto.publishedAt ?? now) : null,
        lastUpdatedAt: now,
      },
    });
    if (post.status === 'PUBLISHED') this.sitemapCache.invalidate();
    return post;
  }

  /**
   * Re-saving any published post bumps `lastUpdatedAt` so the sitemap entry
   * advertises a fresh `lastmod`. We also invalidate the in-process sitemap
   * cache so the next /sitemap.xml hit picks up the change.
   */
  async update(id: string, dto: UpdateInsightDto) {
    const existing = await this.prisma.insightsPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Insight not found');

    const finalStatus = dto.status ?? existing.status;
    const finalBody = dto.body ?? existing.body;
    if (finalStatus === 'PUBLISHED' && wordCount(finalBody) < MIN_PUBLISHED_WORDS) {
      throw new BadRequestException(
        `Published posts must contain at least ${MIN_PUBLISHED_WORDS} words.`,
      );
    }

    const now = new Date();
    let publishedAt = existing.publishedAt;
    if (dto.status === 'PUBLISHED' && !existing.publishedAt) {
      publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : now;
    } else if (dto.publishedAt) {
      publishedAt = new Date(dto.publishedAt);
    }

    const post = await this.prisma.insightsPost.update({
      where: { id },
      data: {
        slug: dto.slug,
        title: dto.title,
        excerpt: dto.excerpt,
        body: dto.body,
        heroImageUrl: dto.heroImageUrl,
        authorTeamMemberId: dto.authorTeamMemberId,
        status: dto.status,
        publishedAt,
        lastUpdatedAt: now,
      },
    });

    // Trigger sitemap cache invalidation whenever a post is touched while
    // published — published-state edits change `lastmod` and sometimes URL.
    if (post.status === 'PUBLISHED' || existing.status === 'PUBLISHED') {
      this.sitemapCache.invalidate();
    }
    return post;
  }
}
