import { BalanceDto } from '../../data/dto/balance.dto';
import { IBaseRepository } from './base.repository';

export abstract class BalanceRepository<TransactionReference = unknown>
  implements IBaseRepository<BalanceDto, TransactionReference>
{
  abstract getById(id: string): Promise<BalanceDto | null>;

  abstract insert(inputDto: Partial<BalanceDto>, transactionReference?: TransactionReference): Promise<BalanceDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<BalanceDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<BalanceDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<BalanceDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<BalanceDto>,
    transactionReference?: TransactionReference,
  ): Promise<BalanceDto | null>;

  abstract count(): Promise<number>;

  abstract getUserLastBalance(userId: string): Promise<BalanceDto | null>;

  abstract getByConsumptionItemId(consumptionItemId: string): Promise<BalanceDto | null>;

  abstract getByPaymentId(paymentId: string): Promise<BalanceDto | null>;
}
