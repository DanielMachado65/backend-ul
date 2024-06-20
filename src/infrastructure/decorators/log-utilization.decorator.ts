import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';
import { LOG_UTILIZATION_METADATA, LogUtilizationInterceptor } from '../interceptor/log-utilization.interceptor';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UseUtilizationLog = (
  actionName: string,
  actionDescription: string,
  actionId?: string,
): ReturnType<typeof applyDecorators> => {
  return applyDecorators(
    SetMetadata(LOG_UTILIZATION_METADATA, { actionName, actionDescription, actionId: actionId || null }),
    UseInterceptors(LogUtilizationInterceptor),
  );
};
