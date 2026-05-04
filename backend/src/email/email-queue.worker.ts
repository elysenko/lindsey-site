import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

const MAX_RETRIES = 6;
// Exponential backoff schedule (in seconds): 30s, 2m, 8m, 30m, 2h, 8h.
// Multiplier: 4x, capped at MAX_RETRIES.
function backoffSeconds(retries: number): number {
  return Math.min(30 * 4 ** retries, 8 * 60 * 60);
}

/**
 * Background worker that reprocesses EmailQueue rows with status=pending.
 *
 * Runs every minute. For each pending row whose last-touched timestamp has
 * cleared its current backoff window, it tries an SMTP send. After
 * MAX_RETRIES attempts the row is marked failed so it stops cycling.
 *
 * Concurrency: NestJS @Cron runs in-process; with multiple replicas we do
 * accept the possibility of two workers picking the same row in the same
 * tick. The worst case is a duplicate email, which is acceptable for the
 * admin-notification use case. If exactly-once is needed in the future,
 * add a `claimedAt`/`claimedBy` column and use `UPDATE ... WHERE
 * claimed_at IS NULL RETURNING *` to lock rows atomically.
 */
@Injectable()
export class EmailQueueWorker {
  private readonly logger = new Logger(EmailQueueWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick(): Promise<void> {
    const now = new Date();
    // Pull a small batch of candidates. We then filter by backoff in JS to
    // keep the SQL simple — pending counts are expected to be small.
    const candidates = await this.prisma.emailQueue.findMany({
      where: { status: 'PENDING', retries: { lt: MAX_RETRIES } },
      orderBy: { createdAt: 'asc' },
      take: 25,
    });

    for (const row of candidates) {
      const nextEligibleAt = new Date(
        row.updatedAt.getTime() + backoffSeconds(row.retries) * 1000,
      );
      if (nextEligibleAt > now) continue;

      const result = await this.email.deliverQueued(row);
      if (result.ok) {
        await this.prisma.emailQueue.update({
          where: { id: row.id },
          data: { status: 'SENT', sentAt: new Date(), lastError: null },
        });
        this.logger.log(`Sent queued email ${row.id} after ${row.retries} retries`);
      } else {
        const newRetries = row.retries + 1;
        const finalStatus = newRetries >= MAX_RETRIES ? 'FAILED' : 'PENDING';
        await this.prisma.emailQueue.update({
          where: { id: row.id },
          data: { retries: newRetries, status: finalStatus, lastError: result.error },
        });
        if (finalStatus === 'FAILED') {
          this.logger.error(`Email ${row.id} permanently failed: ${result.error}`);
        }
      }
    }
  }
}
