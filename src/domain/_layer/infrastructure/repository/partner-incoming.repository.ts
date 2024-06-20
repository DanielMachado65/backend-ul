import { IBaseRepository } from './base.repository';
import { IncomingGroupedByCouponDto } from '../../data/dto/incoming-grouped-by-coupon.dto';
import { PartnerIncomingDto } from '../../data/dto/partner-incoming.dto';

export abstract class PartnerIncomingRepository<TransactionReference = unknown>
  implements IBaseRepository<PartnerIncomingDto, TransactionReference>
{
  abstract getById(id: string): Promise<PartnerIncomingDto | null>;

  abstract insert(
    inputDto: Partial<PartnerIncomingDto>,
    transactionReference?: TransactionReference,
  ): Promise<PartnerIncomingDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<PartnerIncomingDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<PartnerIncomingDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<PartnerIncomingDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<PartnerIncomingDto>,
    transactionReference?: TransactionReference,
  ): Promise<PartnerIncomingDto | null>;

  abstract count(): Promise<number>;

  abstract getIncomingGroupedByCoupon(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ReadonlyArray<IncomingGroupedByCouponDto>>;
}
