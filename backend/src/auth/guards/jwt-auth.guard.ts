import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Thin alias around passport's JWT auth guard so the rest of the app can
 * import a single named symbol.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
