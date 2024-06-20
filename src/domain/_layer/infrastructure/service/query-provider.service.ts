import { GetProviderDataDto } from '../../data/dto/get-provider-data.dto';
import { QueryKeysDto } from '../../data/dto/query-keys.dto';

export abstract class QueryProviderService {
  abstract processServices(
    serviceCodes: ReadonlyArray<number>,
    queryKeys: QueryKeysDto,
    correlationId?: string | null,
    reqParentId?: string | null,
  ): Promise<GetProviderDataDto>;
}
