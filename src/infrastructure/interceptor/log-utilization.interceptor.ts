import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UserUtilizationLogService } from 'src/domain/_layer/infrastructure/service/user-utilization-log.service';

export const LOG_UTILIZATION_METADATA: unique symbol = Symbol('LogUtilizationInterceptor');

@Injectable()
export class LogUtilizationInterceptor implements NestInterceptor {
  constructor(
    private readonly _userUtilizationLogService: UserUtilizationLogService,
    private readonly _reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    try {
      const request: Request = context.switchToHttp().getRequest();
      const maybeUserId: string = request?.['userInfo']?.maybeUserId;
      const defined: {
        readonly actionName: string;
        readonly actionDescription: string;
        readonly actionId: string | null;
      } = this._reflector.get(LOG_UTILIZATION_METADATA, context.getHandler());
      if (defined.actionName && defined.actionDescription && maybeUserId) {
        const actionName: string = defined.actionName;
        const actionDescription: string = defined.actionDescription;
        const actionId: string = defined.actionId;
        this._userUtilizationLogService.sendLog(maybeUserId, actionName, actionDescription, actionId || null);
      }
    } catch (_err) {
      console.log(_err);
      // noop
    }

    return next.handle();
  }
}
