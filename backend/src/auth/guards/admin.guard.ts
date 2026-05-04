import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

/**
 * AdminGuard enforces:
 *   - 401 (unauthenticated) -> caller redirects to /admin/login
 *   - 403 (authenticated but role !== ADMIN)
 *
 * It runs *after* JwtAuthGuard. The two are stacked on every /api/admin/**
 * route via @UseGuards(JwtAuthGuard, AdminGuard) so JWT validation happens
 * first; if Passport rejects the token, JwtAuthGuard already raises 401 with
 * the correct semantics. AdminGuard then only needs to check role.
 *
 * Belt-and-braces: if for some reason no req.user is attached (e.g. a misordered
 * guard chain), we still raise 401 here rather than silently allowing the
 * request through.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user as CurrentUserPayload | undefined;
    if (!user) {
      throw new UnauthorizedException({
        message: 'Authentication required',
        redirect: '/admin/login',
      });
    }
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin role required');
    }
    return true;
  }
}
