import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

export interface OutboundEmail {
  recipient: string;
  subject: string;
  body: string;
}

/**
 * SMTP-backed email service with database-backed retry queue.
 *
 * Design:
 *   - `send()` attempts an immediate SMTP send. On any failure (network,
 *     auth, 5xx), we enqueue and return success. The visitor flow must never
 *     be blocked by SMTP problems.
 *   - `enqueue()` writes an EmailQueue row with status=pending. The worker
 *     (see EmailQueueWorker) reprocesses those with exponential backoff.
 *   - We do not throw on send-and-enqueue paths — callers can rely on the
 *     promise resolving.
 */
@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    if (!process.env.SMTP_HOST) {
      this.logger.warn('SMTP_HOST not set — emails will be queued but never sent.');
      return;
    }
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }

  /**
   * Best-effort immediate send. Falls back to queue on any failure.
   */
  async send(email: OutboundEmail): Promise<{ delivered: boolean; queuedId?: string }> {
    if (!this.transporter) {
      const queued = await this.enqueue(email);
      return { delivered: false, queuedId: queued.id };
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@lebarregroup.com',
        to: email.recipient,
        subject: email.subject,
        text: email.body,
      });
      return { delivered: true };
    } catch (err) {
      this.logger.warn(`SMTP send failed, enqueuing: ${(err as Error).message}`);
      const queued = await this.enqueue(email, (err as Error).message);
      return { delivered: false, queuedId: queued.id };
    }
  }

  /**
   * Persist an email for later retry by the worker.
   */
  async enqueue(email: OutboundEmail, lastError?: string): Promise<{ id: string }> {
    const row = await this.prisma.emailQueue.create({
      data: {
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
        status: 'PENDING',
        lastError: lastError ?? null,
      },
    });
    return { id: row.id };
  }

  /**
   * Try to send a single queue row. Used by the cron worker.
   * Returns true on delivery, false on failure (caller updates retry count).
   */
  async deliverQueued(row: {
    id: string;
    recipient: string;
    subject: string;
    body: string;
  }): Promise<{ ok: true } | { ok: false; error: string }> {
    if (!this.transporter) return { ok: false, error: 'SMTP transporter not configured' };
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@lebarregroup.com',
        to: row.recipient,
        subject: row.subject,
        text: row.body,
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }
}
