import { Request } from 'express';
import { ApiRoles } from '../../domain/_layer/presentation/roles/api-roles.enum';
import { EnvService, ENV_KEYS } from '../framework/env.service';

const headerName: string = 'x-scheduler-token';

export async function schedulerInfoMiddleware(envService: EnvService, req: Request): Promise<ReadonlyArray<ApiRoles>> {
  const header: string = req.header(headerName);

  const token: string = envService.get(ENV_KEYS.SCHEDULER_TOKEN);
  return header === token ? [ApiRoles.SCHEDULER_QUERY_PROVIDER] : [];
}
