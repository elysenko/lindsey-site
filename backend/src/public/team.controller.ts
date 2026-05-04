import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JsonLdService } from '../seo/jsonld.service';

@Controller('team')
export class TeamController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jsonLd: JsonLdService,
  ) {}

  @Get()
  async list() {
    return this.prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        fullName: true,
        title: true,
        honorificPrefix: true,
        headshotUrl: true,
        linkedinUrl: true,
        credentials: true,
      },
    });
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const member = await this.prisma.teamMember.findUnique({ where: { slug } });
    if (!member || !member.isActive) throw new NotFoundException('Team member not found');
    return {
      member,
      jsonLd: {
        person: this.jsonLd.person(member),
        breadcrumbs: this.jsonLd.breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: member.fullName, path: `/team/${member.slug}` },
        ]),
      },
    };
  }
}
