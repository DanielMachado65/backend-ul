import { DateTime } from '../../../../infrastructure/util/date-time-util.service';
import { AllQueryKeys } from '../../../_entity/query-keys.entity';
import { PaginationOf } from '../../data/dto/pagination.dto';
import { QueryDto } from '../../data/dto/query.dto';
import { IBaseRepository } from './base.repository';

export abstract class QueryRepository<TransactionReference = unknown>
  implements IBaseRepository<QueryDto, TransactionReference>
{
  abstract getById(id: string): Promise<QueryDto>;

  abstract insert(inputDto: Partial<QueryDto>, transactionReference?: TransactionReference): Promise<QueryDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<QueryDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<QueryDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<QueryDto>;

  abstract updateById(
    id: string,
    updateDto: Partial<QueryDto>,
    transactionReference?: TransactionReference,
  ): Promise<QueryDto>;

  abstract count(): Promise<number>;

  abstract getDuplicatedQuery(
    userId: string,
    queryCode: number,
    keys: AllQueryKeys,
    finishedFromDate: DateTime,
    processingFromDate: DateTime,
  ): Promise<QueryDto>;

  abstract getByUserId(
    userId: string,
    perPage: number,
    page: number,
    search: string,
    transactionReference?: TransactionReference,
  ): Promise<PaginationOf<QueryDto>>;

  abstract getTestDriveAndRegularQueriesByUserId(
    userId: string,
    perPage: number,
    page: number,
    search: string,
  ): Promise<PaginationOf<QueryDto>>;
}
