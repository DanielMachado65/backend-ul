import { createParamDecorator, ExecutionContext, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { tetrisInfoMiddleware } from 'src/infrastructure/middleware/tetris-info.middleware';
import { ApiRoles } from '../../domain/_layer/presentation/roles/api-roles.enum';
import { EnvService } from '../framework/env.service';
import { arcInfoMiddleware } from './arc-info.middleware';
import { schedulerInfoMiddleware } from './scheduler-info.middleware';

export type ApiInfo = {
  readonly roles: ReadonlyArray<ApiRoles>;
};

export type ExternalApiInfo = (envService: EnvService, req: Request) => Promise<ReadonlyArray<ApiRoles>>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ApiInfo: () => ParameterDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: { readonly apiInfo?: ApiInfo } = ctx.switchToHttp().getRequest();
  return request.apiInfo;
});

@Injectable()
export class ApiInfoMiddleware implements NestMiddleware {
  private readonly _externalApisInfo: ReadonlyArray<ExternalApiInfo>;

  constructor(private readonly _envService: EnvService) {
    this._externalApisInfo = [arcInfoMiddleware, tetrisInfoMiddleware, schedulerInfoMiddleware];
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    let roles: ReadonlyArray<ApiRoles> = [];

    for (let i: number = 0; i < this._externalApisInfo.length; i++) {
      const externalApiInfo: ExternalApiInfo = this._externalApisInfo[i];
      const apiRoles: ReadonlyArray<ApiRoles> = await externalApiInfo(this._envService, req);
      // eslint-disable-next-line functional/immutable-data
      if (apiRoles.length > 0) roles = [...roles, ...apiRoles];
    }

    // eslint-disable-next-line functional/immutable-data
    req['apiInfo'] = { roles };
    next();
  }
}
