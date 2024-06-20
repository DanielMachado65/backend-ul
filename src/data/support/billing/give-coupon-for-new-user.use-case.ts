import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  GiveCouponForNewUserDomain,
  GiveCouponForNewUserIO,
} from 'src/domain/support/billing/give-coupon-for-new-users';
import { UnknownDomainError, UserAlreadyBoughtDomainError } from 'src/domain/_entity/result.error';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';

@Injectable()
export class GiveCouponForNewUserUseCase implements GiveCouponForNewUserDomain {
  private _choosenCoupon: string = 'PROMO10';

  constructor(private readonly _paymentRepository: PaymentRepository) {}

  giveTheCouponForUser(userId: string): GiveCouponForNewUserIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._paymentRepository.countAllFromUserId(userId))
      .filter(UserAlreadyBoughtDomainError.toFn(), (count: number) => count === 0)
      .map((_count: number) => ({ couponCode: this._choosenCoupon }));
  }
}
