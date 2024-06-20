import { QueryKeysEntity } from '../../../_entity/query-keys.entity';
import { ClientType } from '../../../_entity/client.entity';
import { QueryRepresentationEntity } from '../../../_entity/query-representation.entity';

export abstract class QueryLegacyService {
  abstract requestQuery(
    token: string,
    queryCode: number,
    keys: QueryKeysEntity,
    clientType: ClientType,
    mayDuplicate: boolean,
  ): Promise<QueryRepresentationEntity>;
}
