import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { RateLimitService } from '../ratelimit/ratelimit.service';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 60 min
const RATE_LIMIT_MAX = 5;

@Controller('consultations')
export class ConsultationsController {
  constructor(
    private readonly consultations: ConsultationsService,
    private readonly rateLimit: RateLimitService,
  ) {}

  /**
   * `POST /api/consultations`
   *
   * Validates the two-step consultation form, applies a 5-per-hour-per-IP
   * rate limit, persists the lead, and dispatches the admin email
   * notification (with queue fallback). p95 must stay under 1000ms — see
   * MetricsMiddleware.
   */
  @Post()
  async create(
    @Body() dto: CreateConsultationDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ briefToken: string; redirectTo: string }> {
    const ip = (req.ip ?? req.socket.remoteAddress ?? 'unknown').toString();

    const verdict = await this.rateLimit.consume(
      ip,
      'consultation-submit',
      RATE_LIMIT_WINDOW_MS,
      RATE_LIMIT_MAX,
    );
    if (!verdict.allowed) {
      res.setHeader('Retry-After', verdict.retryAfterSec.toString());
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message:
            'You have submitted several requests in a short period. Please contact us directly by phone or email — we look forward to hearing from you.',
          retryAfterSec: verdict.retryAfterSec,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const userAgent = (req.headers['user-agent'] ?? '').toString().slice(0, 512) || null;
    return this.consultations.create(dto, { ip, userAgent });
  }
}
