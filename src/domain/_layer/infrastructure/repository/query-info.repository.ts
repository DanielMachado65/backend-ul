import { QueryInfoEssentialsEntity } from 'src/domain/_entity/query-info.entity';
import { QueryInfoDto } from '../../data/dto/query-info.dto';
import { IBaseRepository } from './base.repository';

export abstract class QueryInfoRepository<TransactionReference = unknown>
  implements IBaseRepository<QueryInfoDto, TransactionReference>
{
  abstract getById(id: string): Promise<QueryInfoDto | null>;

  abstract insert(inputDto: Partial<QueryInfoDto>, transactionReference?: TransactionReference): Promise<QueryInfoDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<QueryInfoDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<QueryInfoDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<QueryInfoDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<QueryInfoDto>,
    transactionReference?: TransactionReference,
  ): Promise<QueryInfoDto | null>;

  abstract count(): Promise<number>;

  abstract getAllActive(): Promise<ReadonlyArray<QueryInfoEssentialsEntity>>;
}
