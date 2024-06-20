import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoCouponFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { Currency } from 'src/infrastructure/util/currency.util';
import { CouponDto } from '../../_layer/data/dto/coupon.dto';

export type ApplyCouponDomainErrors = NoCouponFoundDomainError | UnknownDomainError;

export type ApplyCouponIO<ResultType> = EitherIO<ApplyCouponDomainErrors, ResultType>;

export abstract class ApplyCouponDomain {
  readonly applyForCents: (valueInCents: number, couponId: string, billingId: string) => ApplyCouponIO<number>;

  readonly applyForCurrency: (valueCurrency: Currency, couponId: string, billingId: string) => ApplyCouponIO<Currency>;

  readonly applyForCentsWithCoupon: (
    valueInCents: number,
    coupon: CouponDto | null,
    billingId: string,
  ) => ApplyCouponIO<number>;

  readonly applyForCurrencyWithCoupon: (
    valueCurrency: Currency,
    coupon: CouponDto | null,
    billingId: string,
  ) => ApplyCouponIO<Currency>;
}
