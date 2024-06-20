import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Span } from '@alissonfpmorais/rastru';
import { Injectable } from '@nestjs/common';
import { CouponDto } from 'src/domain/_layer/data/dto/coupon.dto';
import { CouponRepository } from 'src/domain/_layer/infrastructure/repository/coupon.repository';
import { ApplyCouponDomain, ApplyCouponIO } from 'src/domain/support/payment/apply-coupon.domain';
import { Currency, CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { NoCouponFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { CouponRules } from 'src/domain/_entity/coupon.entity';
import { CouponValidationHelper } from './coupon-validation-helper';

@Injectable()
export class ApplyCouponUseCase implements ApplyCouponDomain {
  constructor(
    private readonly _currencyUtil: CurrencyUtil,
    private readonly _couponRepository: CouponRepository,
    private readonly _paymentRepository: PaymentRepository,
  ) {}

  @Span('payment-v3')
  applyForCents(valueInCents: number, couponId: string, billingId: string): ApplyCouponIO<number> {
    const valueCurrency: Currency = this._currencyUtil.numToCurrency(valueInCents, Currency.CENTS_PRECISION);
    return this.applyForCurrency(valueCurrency, couponId, billingId).map((currency: Currency) => currency.toInt());
  }

  @Span('payment-v3')
  applyForCurrency(valueCurrency: Currency, couponId: string, billingId: string): ApplyCouponIO<Currency> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._couponRepository.getById(couponId)).flatMap(
      (coupon: CouponDto) => this.applyForCurrencyWithCoupon(valueCurrency, coupon, billingId),
    );
  }

  @Span('payment-v3')
  applyForCentsWithCoupon(valueInCents: number, coupon: CouponDto | null, billingId: string): ApplyCouponIO<number> {
    const valueCurrency: Currency = this._currencyUtil.numToCurrency(valueInCents, Currency.CENTS_PRECISION);
    return this.applyForCurrencyWithCoupon(valueCurrency, coupon, billingId).map((currency: Currency) => {
      return currency.toInt();
    });
  }

  @Span('payment-v3')
  applyForCurrencyWithCoupon(
    valueCurrency: Currency,
    coupon: CouponDto | null,
    billingId: string,
  ): ApplyCouponIO<Currency> {
    type CouponAndPaymentsCount = { readonly coupon: CouponDto; readonly paymentsCount: number };

    return !coupon
      ? EitherIO.raise(NoCouponFoundDomainError.toFn())
      : EitherIO.from(UnknownDomainError.toFn(), async () => {
          const paymentsCount: number = await this._paymentRepository.countByBillingIdAndCouponId(billingId, coupon.id);
          return { paymentsCount };
        }).flatMap(({ paymentsCount }: CouponAndPaymentsCount) => {
          return this._apply(valueCurrency, coupon, paymentsCount);
        });
  }

  private _apply(valueCurrency: Currency, coupon: CouponDto, paymentsCount: number): ApplyCouponIO<Currency> {
    return CouponValidationHelper.canUse(valueCurrency, coupon, paymentsCount).flatMap((valueCurrency: Currency) => {
      return this._applyDiscount(valueCurrency, coupon);
    });
  }

  private _applyDiscount(valueCurrency: Currency, coupon: CouponDto): ApplyCouponIO<Currency> {
    const { discountValueInCents, discountPercentage }: CouponRules = coupon.rules;

    if (discountPercentage) {
      const discountedCurrency: Currency = valueCurrency.multiply(100 - discountPercentage).divide(100);
      return this._wrapValueCurrencyAndDecreaseCouponUsage(coupon, discountedCurrency);
    } else if (discountValueInCents) {
      const discountedCurrency: Currency = valueCurrency.minusValue(discountValueInCents, Currency.CENTS_PRECISION);
      return this._wrapValueCurrencyAndDecreaseCouponUsage(coupon, discountedCurrency);
    } else {
      return EitherIO.of(UnknownDomainError.toFn(), valueCurrency);
    }
  }

  private _wrapValueCurrencyAndDecreaseCouponUsage(
    coupon: CouponDto,
    valueCurrency: Currency,
  ): ApplyCouponIO<Currency> {
    return EitherIO.of(UnknownDomainError.toFn(), valueCurrency).tap(() => {
      return this._couponRepository.updateUsage(coupon.id, -1);
    });
  }
}
