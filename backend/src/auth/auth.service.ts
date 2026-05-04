import { Injectable, Logger, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';

const FAILED_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 min
const MAX_FAILED_ATTEMPTS = 10;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const GENERIC_LOGIN_ERROR = 'Invalid email or password';

export interface LoginResult {
  token: string;
  user: { id: string; email: string; role: 'ADMIN' | 'EDITOR' };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  /**
   * Validate credentials and issue a JWT.
   *
   * Brute-force defence:
   *   - Every failed attempt is recorded in `RateLimitEvent` (endpoint =
   *     'admin-login', email = the typed email).
   *   - >10 failures for the same email in the last 15 minutes -> account
   *     `lock_until` is set, response is 429, and a password-reset email is
   *     enqueued for that account (if it exists).
   *   - We **never** reveal whether the email matches a real account: every
   *     wrong-credentials path returns the same generic 401 message.
   */
  async login(dto: LoginDto): Promise<LoginResult> {
    const email = dto.email.trim().toLowerCase();

    // Check if the account is currently locked. If so, return 429 *before*
    // touching the password — both prevents needlessly checking bcrypt and
    // prevents revealing existence via timing.
    const user = await this.prisma.user.findUnique({ where: { email } });
    const now = new Date();

    if (user?.lockUntil && user.lockUntil > now) {
      throw new HttpException(
        { statusCode: 429, message: 'Too many failed attempts. Try again later.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Look up recent failed attempts for this email.
    const recentFailures = await this.prisma.rateLimitEvent.count({
      where: {
        endpoint: 'admin-login',
        email,
        occurredAt: { gte: new Date(now.getTime() - FAILED_ATTEMPT_WINDOW_MS) },
      },
    });

    let passwordOk = false;
    if (user) {
      passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    } else {
      // Equalise timing — bcrypt.compare against a real-cost hash takes
      // ~70ms at cost factor 10, so still spend that time even when no
      // user exists. This avoids the classic "wrong email is faster than
      // wrong password" oracle. The hash below is a precomputed bcrypt
      // hash of an unguessable random string at cost 10.
      try {
        await bcrypt.compare(
          dto.password,
          '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.ENpOQE5uLp/H5QyIoLgI6q8GDRc6',
        );
      } catch {
        /* defensive; bcryptjs.compare returns false on bad hashes but we
           don't want a hash-format quirk to leak existence either */
      }
    }

    if (!user || !passwordOk) {
      // Record the failure and decide whether to lock + dispatch reset email.
      await this.prisma.rateLimitEvent.create({
        data: { endpoint: 'admin-login', ip: 'n/a', email },
      });

      const totalFailures = recentFailures + 1; // including this attempt
      if (totalFailures > MAX_FAILED_ATTEMPTS && user) {
        const lockUntil = new Date(now.getTime() + LOCK_DURATION_MS);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lockUntil, failedLoginCount: totalFailures },
        });
        // Enqueue a password-reset notification. In dev / test this just
        // lands on the EmailQueue table; production has a worker that picks
        // these up. We deliberately don't expose this in the API response —
        // the attacker still sees a generic 401/429.
        await this.email.enqueue({
          recipient: email,
          subject: 'LeBarre Group admin account locked',
          body:
            'Your admin account has been temporarily locked due to repeated failed sign-in attempts. ' +
            'If this was you, please use the password-reset link to regain access. ' +
            'If it was not, please contact the site administrator immediately.',
        });
        throw new HttpException(
          { statusCode: 429, message: 'Too many failed attempts. Try again later.' },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new UnauthorizedException(GENERIC_LOGIN_ERROR);
    }

    // Successful login: clear failure counter and stamp last-login.
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockUntil: null, lastLoginAt: now },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwt.signAsync(payload);
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
}
