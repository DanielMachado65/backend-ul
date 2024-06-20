import { SpanLogDto } from '../../data/dto/span-log.dto';
import { IBaseRepository } from './base.repository';

export abstract class SpanLogRepository<TransactionReference = unknown>
  implements IBaseRepository<SpanLogDto, TransactionReference>
{
  abstract getById(id: string): Promise<SpanLogDto | null>;

  abstract insert(inputDto: Partial<SpanLogDto>, transactionReference?: TransactionReference): Promise<SpanLogDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<SpanLogDto>>,
    transactionReference?: TransactionReference | undefined,
  ): Promise<ReadonlyArray<SpanLogDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<SpanLogDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<SpanLogDto>,
    transactionReference?: TransactionReference,
  ): Promise<SpanLogDto | null>;

  abstract count(): Promise<number>;
}
