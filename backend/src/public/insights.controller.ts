import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JsonLdService } from '../seo/jsonld.service';

class ListInsightsQuery {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) pageSize?: number = 12;
}

@Controller('insights')
export class InsightsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jsonLd: JsonLdService,
  ) {}

  @Get()
  async list(@Query() query: ListInsightsQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const where = { status: 'PUBLISHED' as const };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.insightsPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          heroImageUrl: true,
          publishedAt: true,
          lastUpdatedAt: true,
          author: { select: { slug: true, fullName: true, title: true } },
        },
      }),
      this.prisma.insightsPost.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const post = await this.prisma.insightsPost.findUnique({
      where: { slug },
      include: { author: true },
    });
    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundException('Insight not found');
    }
    return {
      post,
      jsonLd: {
        article: this.jsonLd.article(post),
        breadcrumbs: this.jsonLd.breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
          { name: post.title, path: `/insights/${post.slug}` },
        ]),
      },
    };
  }
}
