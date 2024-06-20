import { Request } from 'express';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { ApiRoles } from '../../domain/_layer/presentation/roles/api-roles.enum';

const headerName: string = 'x-arc-token';

export async function arcInfoMiddleware(envService: EnvService, req: Request): Promise<ReadonlyArray<ApiRoles>> {
  const header: string = req.header(headerName);
  const token: string = envService.get(ENV_KEYS.ARC_TOKEN);
  return header === token ? [ApiRoles.ARC_PAYMENT_GATEWAY] : [];
}
