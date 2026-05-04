import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

/**
 * Pull the JWT from either the Authorization header (mobile / API clients)
 * or the `lebarre_admin_session` HTTP-only cookie (browser-based admin UI).
 */
function cookieExtractor(req: Request): string | null {
  const c = (req?.cookies as Record<string, string> | undefined)?.lebarre_admin_session;
  return c ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'insecure-dev-secret-change-me',
    });
  }

  async validate(payload: CurrentUserPayload): Promise<CurrentUserPayload> {
    return payload;
  }
}
