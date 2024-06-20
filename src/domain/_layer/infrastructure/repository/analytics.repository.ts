import { AnalyticsDto } from '../../data/dto/analytics.dto';
import { IBaseRepository } from './base.repository';

export abstract class AnalyticsRepository<TransactionReference = unknown>
  implements IBaseRepository<AnalyticsDto, TransactionReference>
{
  abstract getById(id: string): Promise<AnalyticsDto | null>;

  abstract insert(inputDto: Partial<AnalyticsDto>, transactionReference?: TransactionReference): Promise<AnalyticsDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<AnalyticsDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<AnalyticsDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<AnalyticsDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<AnalyticsDto>,
    transactionReference?: TransactionReference,
  ): Promise<AnalyticsDto | null>;

  abstract count(): Promise<number>;
}
