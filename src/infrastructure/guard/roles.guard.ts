import { CanActivate, CustomDecorator, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UnauthorizedExceptionDomainError } from 'src/domain/_entity/result.error';
import { UserRoles } from '../../domain/_layer/presentation/roles/user-roles.enum';
import { UserInfo } from '../middleware/user-info.middleware';
import { JwtUtil } from '../util/jwt.util';
import { ApiInfo } from '../middleware/api-info.middleware';
import { ApiRoles } from '../../domain/_layer/presentation/roles/api-roles.enum';

type AllRoles = UserRoles | ApiRoles;

type Request = {
  readonly userInfo?: UserInfo;
  readonly apiInfo?: ApiInfo;
};

const metadataKey: string = 'roles';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (roles: ReadonlyArray<AllRoles>): CustomDecorator => SetMetadata(metadataKey, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector, private readonly _jwtUtil: JwtUtil) {}

  private _getRouteRoles(context: ExecutionContext): ReadonlyArray<AllRoles> {
    const maybeRouteRoles: ReadonlyArray<string> = this._reflector.get(metadataKey, context.getHandler());
    const maybeControllerRoles: ReadonlyArray<string> = this._reflector.get(metadataKey, context.getClass());
    return Array.isArray(maybeRouteRoles) && maybeRouteRoles.length > 0
      ? maybeRouteRoles
      : Array.isArray(maybeControllerRoles) && maybeControllerRoles.length > 0
      ? maybeControllerRoles
      : [UserRoles.ADMIN];
  }

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const userRoles: ReadonlyArray<UserRoles> = request.userInfo?.roles || [];
    const apiRoles: ReadonlyArray<ApiRoles> = request.apiInfo?.roles || [];
    const roles: ReadonlyArray<AllRoles> = [...userRoles, ...apiRoles];
    const routeRoles: ReadonlyArray<AllRoles> = this._getRouteRoles(context);
    const isAllowed: boolean = routeRoles.some((role: AllRoles) => roles.includes(role));
    if (isAllowed) return isAllowed;
    throw new UnauthorizedExceptionDomainError();
  }
}
