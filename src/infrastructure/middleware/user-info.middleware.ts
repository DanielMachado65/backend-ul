import { createParamDecorator, ExecutionContext, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UnauthorizedExceptionDomainError } from '../../domain/_entity/result.error';
import { UserRoles } from '../../domain/_layer/presentation/roles/user-roles.enum';
import { AuthUtil, TokenData } from '../util/auth.util';

export type UserInfo = {
  readonly maybeToken: string | null;
  readonly maybeUserId: string | null;
  readonly roles: ReadonlyArray<UserRoles>;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserInfo: () => ParameterDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: { readonly userInfo?: UserInfo } = ctx.switchToHttp().getRequest();
  return request.userInfo;
});

@Injectable()
export class UserInfoMiddleware implements NestMiddleware {
  constructor(private readonly _authUtil: AuthUtil) {}

  private static _getRoles(tokenData: TokenData): ReadonlyArray<UserRoles> {
    return tokenData?.type === 10
      ? [UserRoles.ADMIN, UserRoles.REGULAR, UserRoles.GUEST]
      : !!tokenData
      ? [UserRoles.REGULAR, UserRoles.GUEST]
      : [UserRoles.GUEST];
  }

  private static _toUserInfo(token: string, tokenData: TokenData): UserInfo {
    const roles: ReadonlyArray<UserRoles> = UserInfoMiddleware._getRoles(tokenData);
    return {
      maybeToken: token,
      maybeUserId: tokenData?.id || tokenData?.data,
      roles,
    };
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokenString: string = req.header('Authorization');
      const regularToken: TokenData =
        typeof tokenString === 'string' && tokenString !== '' ? await this._authUtil.verifyToken(tokenString) : null;
      // eslint-disable-next-line functional/immutable-data,require-atomic-updates
      req['userInfo'] = UserInfoMiddleware._toUserInfo(tokenString, regularToken);
      next();
    } catch (_error) {
      throw new UnauthorizedExceptionDomainError();
    }
  }
}
