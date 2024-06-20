import { Request } from 'express';
import { ApiRoles } from '../../domain/_layer/presentation/roles/api-roles.enum';
import { EnvService, ENV_KEYS } from '../framework/env.service';

const headerName: string = 'x-tetris-token';

export async function tetrisInfoMiddleware(envService: EnvService, req: Request): Promise<ReadonlyArray<ApiRoles>> {
  const header: string = req.header(headerName);
  const token: string = envService.get(ENV_KEYS.TETRIS_TOKEN);
  return header === token ? [ApiRoles.TETRIS_QUERY_PROVIDER] : [];
}
