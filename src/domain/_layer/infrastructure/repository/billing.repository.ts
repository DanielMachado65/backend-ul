import { IBaseRepository } from './base.repository';
import { BillingDto } from '../../data/dto/billing.dto';

export abstract class BillingRepository<TransactionReference = unknown>
  implements IBaseRepository<BillingDto, TransactionReference>
{
  abstract getById(id: string): Promise<BillingDto | null>;

  abstract insert(inputDto: Partial<BillingDto>, transactionReference?: TransactionReference): Promise<BillingDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<BillingDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<BillingDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<BillingDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<BillingDto>,
    transactionReference?: TransactionReference,
  ): Promise<BillingDto | null>;

  abstract count(): Promise<number>;

  abstract getByUser(userId: string): Promise<BillingDto>;

  abstract updateAccountFunds(
    userId: string,
    accountFundsInCents: number,
    session?: TransactionReference,
  ): Promise<BillingDto>;
}
