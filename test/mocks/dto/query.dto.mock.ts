import { QueryDocumentType, QueryStatus } from 'src/domain/_entity/query.entity';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';

export const mockQueryDto = (): QueryDto => ({
  id: 'any_query_id',
  createdAt: new Date().toLocaleDateString(),
  documentQuery: 'ABC1234',
  documentType: QueryDocumentType.PLATE,
  executionTime: 1,
  failedServices: [],
  logId: null,
  queryCode: 100,
  queryKeys: {
    plate: 'ABC1234',
  },
  queryStatus: QueryStatus.SUCCESS,
  refClass: 'Consulta teste',
  reprocess: {},
  reprocessedFromQueryId: '',
  responseJson: {},
  stackResult: [],
  status: QueryStatus.SUCCESS,
  userId: 'any_user_id',
  version: 2,
});
