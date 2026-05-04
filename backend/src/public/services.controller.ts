import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JsonLdService } from '../seo/jsonld.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jsonLd: JsonLdService,
  ) {}

  @Get()
  async list() {
    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: { faqs: { orderBy: { displayOrder: 'asc' } } },
    });
    return {
      items: services,
      jsonLd: this.jsonLd.serviceCatalog(services),
    };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug },
      include: { faqs: { orderBy: { displayOrder: 'asc' } } },
    });
    if (!service || !service.isActive) {
      throw new NotFoundException('Service not found');
    }
    return {
      service,
      jsonLd: {
        service: this.jsonLd.service(service),
        faq: this.jsonLd.faqPage(service.faqs.map((f) => ({ question: f.question, answer: f.answer }))),
        breadcrumbs: this.jsonLd.breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.name, path: `/services/${service.slug}` },
        ]),
      },
    };
  }
}
