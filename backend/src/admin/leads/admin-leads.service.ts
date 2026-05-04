import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { sanitizeText } from '../../common/utils/sanitize';
import { ListLeadsDto } from './dto/list-leads.dto';
import {
  BRIEF_FIELD_KEYS,
  BriefFieldKey,
  UpdateLeadDto,
} from './dto/update-lead.dto';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class AdminLeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListLeadsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where: Prisma.LeadWhereInput = {};
    if (query.challengeCategory) {
      where.challengeCategories = { has: query.challengeCategory };
    }
    if (query.leadStatus) where.leadStatus = query.leadStatus;
    if (query.briefStatus) where.briefStatus = query.briefStatus;

    const orderBy: Prisma.LeadOrderByWithRelationInput = (() => {
      switch (query.sort) {
        case 'createdAt:asc':
          return { createdAt: 'asc' };
        case 'organization:asc':
          return { organization: 'asc' };
        case 'organization:desc':
          return { organization: 'desc' };
        case 'createdAt:desc':
        default:
          return { createdAt: 'desc' };
      }
    })();

    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          organization: true,
          email: true,
          challengeCategories: true,
          createdAt: true,
          briefStatus: true,
          leadStatus: true,
          primaryService: { select: { slug: true, name: true } },
        },
      }),
      this.prisma.lead.count({ where }),
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

  async getById(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        primaryService: { select: { id: true, slug: true, name: true } },
        brandBrief: {
          include: {
            audits: {
              orderBy: { editedAt: 'desc' },
              include: {
                editedBy: { select: { id: true, email: true } },
              },
            },
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, email: true } } },
        },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  /**
   * Apply a partial update to a lead. Behaviour:
   *  - `leadStatus` updates the lead row directly.
   *  - Any brief-field updates are written to BrandBrief (creating one if
   *    the visitor never completed it) and an audit row is appended for
   *    each changed field, preserving the previous value and stamping the
   *    admin user id + edit timestamp.
   *
   * The whole update runs in a transaction so the audit trail is consistent
   * with the resulting brief state.
   */
  async update(
    id: string,
    dto: UpdateLeadDto,
    actor: { sub: string },
  ): Promise<{ ok: true }> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { brandBrief: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    // Sanitize all string inputs from the admin UI. Admins are trusted but
    // we still don't want stray HTML rendered in the dashboard.
    const sanitized = {} as UpdateLeadDto;
    for (const [k, v] of Object.entries(dto)) {
      if (typeof v === 'string') {
        (sanitized as Record<string, unknown>)[k] = sanitizeText(v);
      } else {
        (sanitized as Record<string, unknown>)[k] = v;
      }
    }

    // Compute brief-field deltas vs the current persisted brief.
    const previousBrief = lead.brandBrief;
    const briefDelta: Partial<Record<BriefFieldKey, string | null>> = {};
    const auditRows: Prisma.BrandBriefAuditCreateManyInput[] = [];

    // We need the brief id for audit FKs — if it doesn't exist yet, create
    // it inside the same transaction first.
    await this.prisma.$transaction(async (tx) => {
      let brief = previousBrief;
      const briefFieldsTouched = BRIEF_FIELD_KEYS.some((k) => k in sanitized);

      if (briefFieldsTouched && !brief) {
        brief = await tx.brandBrief.create({
          data: { leadId: lead.id, submittedAt: null },
        });
      }

      if (brief) {
        for (const key of BRIEF_FIELD_KEYS) {
          if (!(key in sanitized)) continue;
          const newValue =
            (sanitized as Record<string, unknown>)[key] === undefined
              ? null
              : ((sanitized as Record<string, string | null>)[key] ?? null);
          const previousValue =
            ((brief as unknown as Record<string, string | null>)[key]) ?? null;
          if (newValue !== previousValue) {
            briefDelta[key] = newValue;
            auditRows.push({
              brandBriefId: brief.id,
              fieldName: key,
              previousValue,
              newValue,
              editedByUserId: actor.sub,
            });
          }
        }
      }

      if (Object.keys(briefDelta).length > 0 && brief) {
        await tx.brandBrief.update({
          where: { id: brief.id },
          data: briefDelta,
        });
      }
      if (auditRows.length > 0) {
        await tx.brandBriefAudit.createMany({ data: auditRows });
      }
      if (sanitized.leadStatus) {
        await tx.lead.update({
          where: { id: lead.id },
          data: { leadStatus: sanitized.leadStatus },
        });
      }
    });

    return { ok: true };
  }

  async addNote(
    leadId: string,
    dto: CreateNoteDto,
    actor: { sub: string },
  ): Promise<{ id: string; createdAt: Date }> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const body = sanitizeText(dto.body);
    if (!body) throw new NotFoundException('Note body required'); // shouldn't hit — validated upstream
    const note = await this.prisma.leadNote.create({
      data: { leadId: lead.id, authorUserId: actor.sub, body },
    });
    return { id: note.id, createdAt: note.createdAt };
  }
}
