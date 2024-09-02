import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';

export const RequireLogin = () => SetMetadata('require-login', true);

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('require-permissions', permissions);

export const GetUserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      return null;
    }
    return data ? request.user[data] : request.user;
  },
);
