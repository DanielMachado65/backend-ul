import { ClientType } from 'src/domain/_entity/client.entity';
import { QueryKeysEntity } from 'src/domain/_entity/query-keys.entity';
import { QueryRepresentationEntity } from 'src/domain/_entity/query-representation.entity';
import { QueryStatus } from 'src/domain/_entity/query.entity';
import { QueryLegacyService } from 'src/domain/_layer/infrastructure/service/query-legacy.service';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';

export class LegacyOncApiMockService implements QueryLegacyService {
  async requestQuery(
    token: string,
    queryCode: number,
    keys: QueryKeysEntity,
    _clientType: ClientType,
    _mayDuplicate: boolean,
  ): Promise<QueryRepresentationEntity> {
    return {
      id: TestUtil.generateId(),
      code: queryCode,
      name: token,
      plate: keys.plate,
      brandAndModel: 'Hotwheels',
      brandImageUrl: 'any.webp',
      createdAt: new Date().toISOString(),
      keys,
      dsl: {
        code: queryCode,
        badges: [],
        components: [],
        products: [],
      },
      failedServices: [],
      status: QueryStatus.SUCCESS,
      queryStatus: QueryStatus.SUCCESS,
      rules: [],
    };
  }
}
