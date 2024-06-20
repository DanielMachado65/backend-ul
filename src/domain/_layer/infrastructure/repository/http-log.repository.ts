import { HttpLogDto } from '../../data/dto/http-log.dto';
import { IBaseRepository } from './base.repository';

export abstract class HttpLogRepository<TransactionReference = unknown>
  implements IBaseRepository<HttpLogDto, TransactionReference>
{
  abstract generateNewId(): string;

  abstract getById(id: string): Promise<HttpLogDto | null>;

  abstract insert(inputDto: Partial<HttpLogDto>, transactionReference?: TransactionReference): Promise<HttpLogDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<HttpLogDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<HttpLogDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<HttpLogDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<HttpLogDto>,
    transactionReference?: TransactionReference,
  ): Promise<HttpLogDto | null>;

  abstract count(): Promise<number>;
}
