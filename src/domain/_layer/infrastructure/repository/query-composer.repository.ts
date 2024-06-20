import { IBaseRepository } from './base.repository';
import { QueryComposerDto } from '../../data/dto/query-composer.dto';

export abstract class QueryComposerRepository<TransactionReference = unknown>
  implements IBaseRepository<QueryComposerDto, TransactionReference>
{
  abstract getBatchByCodes(codes: ReadonlyArray<string>): Promise<ReadonlyArray<QueryComposerDto>>;

  abstract getById(id: string): Promise<QueryComposerDto>;

  abstract getByQueryCode(queryCode: number): Promise<QueryComposerDto>;

  abstract insert(
    inputDto: Partial<QueryComposerDto>,
    transactionReference?: TransactionReference,
  ): Promise<QueryComposerDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<QueryComposerDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<QueryComposerDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<QueryComposerDto>;

  abstract updateById(
    id: string,
    updateDto: Partial<QueryComposerDto>,
    transactionReference?: TransactionReference,
  ): Promise<QueryComposerDto>;

  abstract count(): Promise<number>;
}
