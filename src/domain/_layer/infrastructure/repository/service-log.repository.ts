import { IBaseRepository } from './base.repository';
import { ServiceLogDto } from '../../data/dto/service-log.dto';

export abstract class ServiceLogRepository<TransactionReference = unknown>
  implements IBaseRepository<ServiceLogDto, TransactionReference>
{
  abstract getById(id: string): Promise<ServiceLogDto>;

  abstract insert(
    inputDto: Partial<ServiceLogDto>,
    transactionReference?: TransactionReference,
  ): Promise<ServiceLogDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<ServiceLogDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<ServiceLogDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<ServiceLogDto>;

  abstract updateById(
    id: string,
    updateDto: Partial<ServiceLogDto>,
    transactionReference?: TransactionReference,
  ): Promise<ServiceLogDto>;

  abstract count(): Promise<number>;
}
