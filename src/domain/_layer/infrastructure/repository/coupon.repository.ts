import { CouponDto } from '../../data/dto/coupon.dto';
import { IBaseRepository } from './base.repository';

export abstract class CouponRepository<TransactionReference = unknown>
  implements IBaseRepository<CouponDto, TransactionReference>
{
  abstract getById(id: string): Promise<CouponDto | null>;

  abstract getByCode(code: string): Promise<CouponDto | null>;

  abstract getByIdOrCode(id: string, code: string): Promise<CouponDto | null>;

  abstract insert(inputDto: Partial<CouponDto>, transactionReference?: TransactionReference): Promise<CouponDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<CouponDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<CouponDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<CouponDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<CouponDto>,
    transactionReference?: TransactionReference,
  ): Promise<CouponDto | null>;

  abstract updateUsage(
    id: string,
    incrementBy: number,
    transactionReference?: TransactionReference,
  ): Promise<CouponDto | null>;

  abstract count(): Promise<number>;

  abstract countAllCreatedByUser(userId: string): Promise<number>;
}
