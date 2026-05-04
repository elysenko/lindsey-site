import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  sub: string; // user id
  email: string;
  role: 'ADMIN' | 'EDITOR';
}

export const CurrentUser = createParamDecorator<unknown, ExecutionContext, CurrentUserPayload>(
  (_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as CurrentUserPayload;
  },
);
