import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sanitizeObject } from '../common/utils/sanitize';
import { UpsertBriefDto } from './dto/upsert-brief.dto';

@Injectable()
export class BriefService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Look up a lead by its brief-completion token. Returns a "shell" payload
   * with only the data needed to render the brief form — never the full lead
   * record (no internal notes, no audit trail). 404s on unknown/superseded
   * tokens.
   */
  async getByToken(token: string): Promise<{
    fullName: string;
    organization: string;
    primaryServiceSlug: string | null;
    challengeCategories: string[];
    briefStatus: 'PENDING' | 'COMPLETED';
    brief: {
      missionStatement: string | null;
      visionStatement: string | null;
      differentiator: string | null;
      brandStory: string | null;
      audiences: string | null;
      voiceDescriptors: string | null;
      successDefinition: string | null;
    } | null;
  }> {
    const lead = await this.prisma.lead.findUnique({
      where: { briefToken: token },
      include: {
        primaryService: { select: { slug: true } },
        brandBrief: true,
      },
    });
    if (!lead) {
      throw new NotFoundException('Brief not found. Please contact us directly.');
    }
    return {
      fullName: lead.fullName,
      organization: lead.organization,
      primaryServiceSlug: lead.primaryService?.slug ?? null,
      challengeCategories: lead.challengeCategories,
      briefStatus: lead.briefStatus,
      brief: lead.brandBrief
        ? {
            missionStatement: lead.brandBrief.missionStatement,
            visionStatement: lead.brandBrief.visionStatement,
            differentiator: lead.brandBrief.differentiator,
            brandStory: lead.brandBrief.brandStory,
            audiences: lead.brandBrief.audiences,
            voiceDescriptors: lead.brandBrief.voiceDescriptors,
            successDefinition: lead.brandBrief.successDefinition,
          }
        : null,
    };
  }

  /**
   * Upsert the BrandBrief attached to the lead identified by `token`.
   * Marks the parent Lead.briefStatus = COMPLETED. Returns a thin
   * confirmation payload — the front-end only needs to know it succeeded.
   */
  async upsert(token: string, dto: UpsertBriefDto): Promise<{ ok: true; submittedAt: string }> {
    const lead = await this.prisma.lead.findUnique({
      where: { briefToken: token },
      select: { id: true },
    });
    if (!lead) {
      throw new NotFoundException('Brief not found. Please contact us directly.');
    }

    // Reject a completely empty payload — the spec lets visitors submit
    // *any subset*, but submitting nothing is just noise.
    const cleaned = sanitizeObject({ ...dto });
    const hasAny = Object.values(cleaned).some((v) => v != null && v !== '');
    if (!hasAny) {
      throw new BadRequestException('Please complete at least one field before submitting.');
    }

    const submittedAt = new Date();
    await this.prisma.$transaction([
      this.prisma.brandBrief.upsert({
        where: { leadId: lead.id },
        create: {
          leadId: lead.id,
          missionStatement: cleaned.missionStatement ?? null,
          visionStatement: cleaned.visionStatement ?? null,
          differentiator: cleaned.differentiator ?? null,
          brandStory: cleaned.brandStory ?? null,
          audiences: cleaned.audiences ?? null,
          voiceDescriptors: cleaned.voiceDescriptors ?? null,
          successDefinition: cleaned.successDefinition ?? null,
          submittedAt,
        },
        update: {
          missionStatement: cleaned.missionStatement ?? undefined,
          visionStatement: cleaned.visionStatement ?? undefined,
          differentiator: cleaned.differentiator ?? undefined,
          brandStory: cleaned.brandStory ?? undefined,
          audiences: cleaned.audiences ?? undefined,
          voiceDescriptors: cleaned.voiceDescriptors ?? undefined,
          successDefinition: cleaned.successDefinition ?? undefined,
          submittedAt,
        },
      }),
      this.prisma.lead.update({
        where: { id: lead.id },
        data: { briefStatus: 'COMPLETED' },
      }),
    ]);

    return { ok: true, submittedAt: submittedAt.toISOString() };
  }
}
