import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  CountCouponsCreatedByUserDomain,
  CountCouponsCreatedByUserIO,
} from 'src/domain/support/coupon/count-coupons-created-by-user.domain';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { CouponRepository } from 'src/domain/_layer/infrastructure/repository/coupon.repository';

@Injectable()
export class CountCouponsCreatedByUserUseCase implements CountCouponsCreatedByUserDomain {
  constructor(private readonly _couponRepository: CouponRepository) {}

  countCouponsCreatedByUser(userId: string): CountCouponsCreatedByUserIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._couponRepository.countAllCreatedByUser(userId));
  }
}
