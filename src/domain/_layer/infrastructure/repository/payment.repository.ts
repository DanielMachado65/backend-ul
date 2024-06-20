import { IBaseRepository } from './base.repository';
import { PaginationOf } from '../../data/dto/pagination.dto';
import { PaymentDto } from '../../data/dto/payment.dto';
import { PaymentGatewayType } from 'src/domain/_entity/payment.entity';

export type PaymentsSucceededByTenant = {
  readonly cnpj: string;
  readonly paymentsAmount: number;
  readonly revenueInCents: number;
};

export abstract class PaymentRepository<TransactionReference = unknown>
  implements IBaseRepository<PaymentDto, TransactionReference>
{
  abstract getByExternalReferenceGateway(externalReference: string, gateway: PaymentGatewayType): Promise<PaymentDto>;

  abstract getByUserId(userId: string, page: number, perPage: number): Promise<ReadonlyArray<PaymentDto>>;

  abstract getByBillingId(billingId: string): Promise<ReadonlyArray<PaymentDto>>;

  abstract getByUserIdWithCount(
    userId: string,
    page: number,
    perPage: number,
    search: string,
  ): Promise<PaginationOf<PaymentDto>>;

  abstract getById(id: string): Promise<PaymentDto | null>;

  abstract insert(inputDto: Partial<PaymentDto>, transactionReference?: TransactionReference): Promise<PaymentDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<PaymentDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<PaymentDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<PaymentDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<PaymentDto>,
    transactionReference?: TransactionReference,
  ): Promise<PaymentDto | null>;

  abstract countAllFromBillingId(billingId: string): Promise<number>;

  abstract countAllFromUserId(userId: string): Promise<number>;

  abstract count(): Promise<number>;

  abstract countByBillingIdAndCouponId(billingId: string, couponId: string): Promise<number>;

  abstract getByUserAndPaymentId(userId: string, paymentId: string): Promise<PaymentDto | null>;

  abstract getAmountSucceededByTenant(): Promise<ReadonlyArray<PaymentsSucceededByTenant>>;
}
