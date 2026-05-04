import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JsonLdService } from '../seo/jsonld.service';

@Controller('faq')
export class FaqController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jsonLd: JsonLdService,
  ) {}

  /**
   * Returns FAQs grouped by category alongside a single FAQPage JSON-LD blob
   * covering every Q/A pair (per spec — schema.org/FAQPage at the page level).
   */
  @Get()
  async list() {
    const items = await this.prisma.siteFaq.findMany({
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });

    const groups: Record<string, { question: string; answer: string }[]> = {};
    for (const f of items) {
      groups[f.category] ??= [];
      groups[f.category].push({ question: f.question, answer: f.answer });
    }

    return {
      groups,
      jsonLd: this.jsonLd.faqPage(items.map((f) => ({ question: f.question, answer: f.answer }))),
    };
  }
}
