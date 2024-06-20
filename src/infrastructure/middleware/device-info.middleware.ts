/* eslint-disable functional/immutable-data */
import { createParamDecorator, ExecutionContext, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { UserAgentUtil } from '../util/user-agent.util';
import { DeviceInfoData, DeviceKind } from '../../domain/_layer/infrastructure/middleware/device-info.middleware';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const DeviceInfo: () => ParameterDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: { readonly deviceInfo?: DeviceInfoData } = ctx.switchToHttp().getRequest();
  return request.deviceInfo;
});

@Injectable()
export class DeviceInfoMiddleware implements NestMiddleware {
  constructor(private readonly _userAgentUtil: UserAgentUtil) {}

  private _getUserAgent(req: Request): string | null {
    return req.headers['user-agent'] || null;
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userAgent: string | null = this._getUserAgent(req);
      if (!userAgent) req['deviceInfo'] = { userAgent: null, deviceKind: DeviceKind.UNKNOWN };

      const deviceKind: DeviceKind = this._userAgentUtil.isMobile(userAgent) ? DeviceKind.MOBILE : DeviceKind.COMPUTER;
      req['deviceInfo'] = { userAgent, deviceKind };
    } catch (_error) {
      req['deviceInfo'] = { userAgent: null, deviceKind: DeviceKind.UNKNOWN };
    }

    next();
  }
}
