import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConsumeResult {
  allowed: boolean;
  retryAfterSec: number;
  remaining: number;
}

/**
 * Persistent, DB-backed rate limiter.
 *
 * Choosing the database (rather than an in-process Map or Redis) is deliberate:
 *
 *   1. Multiple replicas of the API behind a load balancer must share the
 *      counter, otherwise an attacker who lands on different pods gets a
 *      multiplied budget. Postgres is already in the deployment; Redis was
 *      requested in infra constraints but isn't yet wired up here.
 *   2. The rate-limit window for the consultation form is 60 minutes — long
 *      enough that the row count stays small (5 per IP/hour). The composite
 *      indexes (ip,endpoint,occurredAt) keep lookups O(log n).
 *   3. Audit value: the same `RateLimitEvent` table records both consultation
 *      submissions and admin-login failures, giving ops a single timeline
 *      they can grep when triaging abuse.
 *
 * A future migration to Redis can be a drop-in replacement for this class
 * without touching callers.
 */
@Injectable()
export class RateLimitService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record a hit and decide whether to allow the request.
   *
   * @param ip        Client IP (resolved from `trust proxy` upstream).
   * @param endpoint  Logical bucket name, e.g. 'consultation-submit'.
   * @param windowMs  Sliding-window length in milliseconds.
   * @param limit     Max events per window before blocking.
   */
  async consume(
    ip: string,
    endpoint: string,
    windowMs: number,
    limit: number,
  ): Promise<ConsumeResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    const recent = await this.prisma.rateLimitEvent.count({
      where: { ip, endpoint, occurredAt: { gte: windowStart } },
    });

    if (recent >= limit) {
      // Block. Don't record the rejected attempt — we want the window to
      // start expiring naturally rather than perpetually re-arming.
      const oldestInWindow = await this.prisma.rateLimitEvent.findFirst({
        where: { ip, endpoint, occurredAt: { gte: windowStart } },
        orderBy: { occurredAt: 'asc' },
      });
      const retryAfterSec = oldestInWindow
        ? Math.max(
            1,
            Math.ceil((oldestInWindow.occurredAt.getTime() + windowMs - now.getTime()) / 1000),
          )
        : Math.ceil(windowMs / 1000);
      return { allowed: false, retryAfterSec, remaining: 0 };
    }

    await this.prisma.rateLimitEvent.create({ data: { ip, endpoint } });
    return { allowed: true, retryAfterSec: 0, remaining: Math.max(0, limit - recent - 1) };
  }
}
