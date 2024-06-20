import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { CouponRules } from 'src/domain/_entity/coupon.entity';
import {
  CouponExpiredDomainError,
  CouponLimitForUserReachedDomainError,
  CouponMinValueNotReachedDomainError,
  CouponMinValueNotReachedDomainErrorDetails,
  NoCouponFoundDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { CouponDto } from 'src/domain/_layer/data/dto/coupon.dto';
import { Currency } from 'src/infrastructure/util/currency.util';

export type ValidationCouponDomainErrors =
  | NoCouponFoundDomainError
  | UnknownDomainError
  | CouponExpiredDomainError
  | CouponLimitForUserReachedDomainError
  | CouponMinValueNotReachedDomainError;

export class CouponValidationHelper {
  static canUse(
    valueCurrency: Currency,
    coupon: CouponDto,
    paymentsCount: number,
  ): EitherIO<ValidationCouponDomainErrors, Currency> {
    if (!CouponValidationHelper._canUseCoupon(coupon)) {
      return EitherIO.raise(CouponExpiredDomainError.toFn());
    }
    const { minValueToApplyInCents }: CouponRules = coupon.rules;

    if (this._hasExceededUsageLimit(coupon, paymentsCount))
      return EitherIO.raise(CouponLimitForUserReachedDomainError.toFn());
    if (this._hasNotReachedMinValue(valueCurrency, minValueToApplyInCents)) {
      const details: CouponMinValueNotReachedDomainErrorDetails = {
        couponId: coupon.id,
        couponCode: coupon.code,
        realPriceInCents: valueCurrency.toInt(),
        minValueToApplyInCents: minValueToApplyInCents,
      };
      return EitherIO.raise(CouponMinValueNotReachedDomainError.toFn(details));
    }

    return EitherIO.of(UnknownDomainError.toFn(), valueCurrency);
  }

  private static _canUseCoupon(coupon: CouponDto): boolean {
    return (
      coupon.status &&
      coupon.rules.limitUsage > 0 &&
      (!coupon.rules.expirationDate || new Date() < new Date(coupon.rules.expirationDate))
    );
  }

  private static _hasExceededUsageLimit(coupon: CouponDto, paymentsCount: number): boolean {
    return coupon.rules.usageMaxToUser <= 0 || !coupon.rules.usageMaxToUser
      ? false
      : paymentsCount >= coupon.rules.usageMaxToUser;
  }

  private static _hasNotReachedMinValue(valueCurrency: Currency, minValueToApplyInCents: number): boolean {
    return valueCurrency.lessThanValue(minValueToApplyInCents, Currency.CENTS_PRECISION);
  }
}
