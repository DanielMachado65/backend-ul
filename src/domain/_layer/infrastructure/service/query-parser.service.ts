import { ClientType } from '../../../_entity/client.entity';
import { QueryParsedData } from '../../../_entity/query-representation.entity';

export abstract class QueryParserService {
  abstract parseQuery(
    queryCode: number,
    clientType: ClientType,
    responseJson: unknown,
    templateVersion?: number,
  ): Promise<QueryParsedData>;
}
