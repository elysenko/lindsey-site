import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { generateBriefToken } from '../common/utils/tokens';
import { sanitizeText } from '../common/utils/sanitize';

export interface ConsultationCreated {
  briefToken: string;
  redirectTo: string;
}

@Injectable()
export class ConsultationsService {
  private readonly logger = new Logger(ConsultationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  /**
   * Persist a new lead and best-effort dispatch the admin notification.
   *
   * The DB write is the source of truth; SMTP failure must never block the
   * happy path (see scenario "Admin email notification — SMTP upstream
   * failure"). EmailService.send() handles the queue fallback internally,
   * so from this method's perspective the call always succeeds.
   */
  async create(
    dto: CreateConsultationDto,
    meta: { ip: string | null; userAgent: string | null },
  ): Promise<ConsultationCreated> {
    const briefToken = generateBriefToken();

    // Resolve service slug -> id (best-effort; if the slug is unknown we just
    // store null rather than rejecting — the admin can re-classify).
    let primaryServiceId: string | null = null;
    if (dto.primaryServiceSlug) {
      const svc = await this.prisma.service.findUnique({
        where: { slug: dto.primaryServiceSlug },
        select: { id: true },
      });
      primaryServiceId = svc?.id ?? null;
    }

    // Sanitise free-text. class-validator already trimmed obvious garbage,
    // but this strips any HTML/script content that snuck through.
    const fullName = sanitizeText(dto.fullName) ?? '';
    const organization = sanitizeText(dto.organization) ?? '';
    const phone = sanitizeText(dto.phone ?? null);
    const situationDescription = sanitizeText(dto.situationDescription) ?? '';

    const lead = await this.prisma.lead.create({
      data: {
        briefToken,
        fullName,
        organization,
        email: dto.email.trim().toLowerCase(),
        phone,
        primaryServiceId,
        challengeCategories: dto.challengeCategories,
        situationDescription,
        leadStatus: 'NEW',
        briefStatus: 'PENDING',
        submittedIp: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    // Fire the admin notification — fire-and-forget but awaited so failures
    // are logged. The EmailService internally falls back to the queue.
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      try {
        await this.email.send({
          recipient: adminEmail,
          subject: `New consultation request from ${fullName} (${organization})`,
          body:
            `A new consultation request was submitted.\n\n` +
            `Name: ${fullName}\n` +
            `Organization: ${organization}\n` +
            `Email: ${lead.email}\n` +
            `Phone: ${phone ?? '—'}\n` +
            `Challenge categories: ${dto.challengeCategories.join(', ')}\n` +
            `Situation: ${situationDescription}\n\n` +
            `View in admin: /admin/leads/${lead.id}`,
        });
      } catch (err) {
        this.logger.warn(
          `Admin notification dispatch failed (visitor flow unaffected): ${(err as Error).message}`,
        );
      }
    }

    return { briefToken, redirectTo: '/consult/thank-you' };
  }
}
