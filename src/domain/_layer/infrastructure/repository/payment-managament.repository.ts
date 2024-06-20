import { PaymentManagementDto } from 'src/domain/_layer/data/dto/payment-management.dto';
import { IBaseRepository } from 'src/domain/_layer/infrastructure/repository/base.repository';

export abstract class PaymentManagementRepository<TransactionReference = unknown>
  implements IBaseRepository<PaymentManagementDto, TransactionReference>
{
  abstract getById(id: string): Promise<PaymentManagementDto>;
  abstract getCurrent(): Promise<PaymentManagementDto>;
  abstract insert(
    inputDto: Partial<PaymentManagementDto>,
    transactionReference?: TransactionReference,
  ): Promise<PaymentManagementDto>;
  abstract insertMany(
    inputs: readonly Partial<PaymentManagementDto>[],
    transactionReference?: TransactionReference,
  ): Promise<ReadonlyArray<PaymentManagementDto>>;
  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<PaymentManagementDto>;
  abstract updateById(
    id: string,
    updateDto: Partial<PaymentManagementDto>,
    transactionReference?: TransactionReference,
  ): Promise<PaymentManagementDto>;
  abstract count(): Promise<number>;
}
