import { ConsumptionStatementDto } from '../../data/dto/consumption-statement.dto';
import { IBaseRepository } from './base.repository';

export abstract class ConsumptionStatementRepository<TransactionReference = unknown>
  implements IBaseRepository<ConsumptionStatementDto, TransactionReference>
{
  abstract getById(id: string): Promise<ConsumptionStatementDto | null>;

  abstract insert(
    inputDto: Partial<ConsumptionStatementDto>,
    transactionReference?: TransactionReference,
  ): Promise<ConsumptionStatementDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<ConsumptionStatementDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<ConsumptionStatementDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<ConsumptionStatementDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<ConsumptionStatementDto>,
    transactionReference?: TransactionReference,
  ): Promise<ConsumptionStatementDto | null>;

  abstract count(): Promise<number>;

  abstract getByQueryId(queryId: string): Promise<ConsumptionStatementDto | null>;
}
