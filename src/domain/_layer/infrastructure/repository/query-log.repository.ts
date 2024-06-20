import { IBaseRepository } from './base.repository';
import { QueryLogDto } from '../../data/dto/query-log.dto';

export abstract class QueryLogRepository<TransactionReference = unknown>
  implements IBaseRepository<QueryLogDto, TransactionReference>
{
  abstract getById(id: string): Promise<QueryLogDto>;

  abstract insert(inputDto: Partial<QueryLogDto>, transactionReference?: TransactionReference): Promise<QueryLogDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<QueryLogDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<QueryLogDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<QueryLogDto>;

  abstract updateById(
    id: string,
    updateDto: Partial<QueryLogDto>,
    transactionReference?: TransactionReference,
  ): Promise<QueryLogDto>;

  abstract updateByQueryId(
    queryId: string,
    updateDto: Partial<QueryLogDto>,
    transactionReference?: TransactionReference,
  ): Promise<QueryLogDto>;

  abstract count(): Promise<number>;
}
