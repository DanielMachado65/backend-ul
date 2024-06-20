import { PaymentStatus } from 'src/domain/_entity/payment.entity';
import { CouponDto } from 'src/domain/_layer/data/dto/coupon.dto';
import { ApplyCouponDomain } from 'src/domain/support/payment/apply-coupon.domain';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { Currency } from 'src/infrastructure/util/currency.util';
import {
  CouponExpiredDomainError,
  CouponLimitForUserReachedDomainError,
  CouponMinValueNotReachedDomainError,
  NoCouponFoundDomainError,
} from '../../../../domain/_entity/result.error';
import { BillingDto } from '../../../../domain/_layer/data/dto/billing.dto';
import { UserDto } from '../../../../domain/_layer/data/dto/user.dto';

describe(ApplyCouponDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<ApplyCouponDomain> = TestSetup.run(ApplyCouponDomain);

  test('Applying a percent coupon', async () => {
    /** - Setup - */
    const discountPercent: number = 5;
    const value: number = 100_00;
    const valueCurrency: Currency = setup.utils.currency.numToCurrency(value, Currency.CENTS_PRECISION);

    const coupon: CouponDto = await setup.repositories.coupon.insert({
      status: true,
      code: 'coupon',
      rules: {
        discountValueInCents: 0,
        discountPercentage: discountPercent,
        minValueToApplyInCents: null,
        expirationDate: null,
        limitUsage: 4,
        usageMaxToUser: 0,
        authorized: undefined,
      },
    });

    /** - Run - */
    const appliedValue: number = await setup.useCase.applyForCents(value, coupon.id, null).unsafeRun();
    const appliedValueCurrency: Currency = await setup.useCase
      .applyForCurrency(valueCurrency, coupon.id, null)
      .unsafeRun();
    const appliedValueForCoupon: number = await setup.useCase.applyForCentsWithCoupon(value, coupon, null).unsafeRun();
    const appliedValueCurrencyForCoupon: Currency = await setup.useCase
      .applyForCurrencyWithCoupon(valueCurrency, coupon, null)
      .unsafeRun();
    const updatedCoupon: CouponDto = await setup.repositories.coupon.getById(coupon.id);

    /** - Test - */
    expect(updatedCoupon).toEqual({ ...coupon, rules: { ...coupon.rules, limitUsage: 0 }, status: true });
    expect(appliedValue).toBe(95_00);
    expect(appliedValueCurrency.toInt()).toBe(95_00);
    expect(appliedValueForCoupon).toBe(95_00);
    expect(appliedValueCurrencyForCoupon.toInt()).toBe(95_00);
  });

  test('Applying a value coupon', async () => {
    /** - Setup - */
    const discountValue: number = 10_00;
    const value: number = 100_00;
    const valueCurrency: Currency = setup.utils.currency.numToCurrency(value, Currency.CENTS_PRECISION);

    const coupon: CouponDto = await setup.repositories.coupon.insert({
      status: true,
      code: 'coupon',
      rules: {
        discountValueInCents: discountValue,
        discountPercentage: 0,
        minValueToApplyInCents: null,
        expirationDate: null,
        limitUsage: 4,
        usageMaxToUser: 0,
        authorized: undefined,
      },
    });

    /** - Run - */
    const appliedValue: number = await setup.useCase.applyForCents(value, coupon.id, null).unsafeRun();
    const appliedValueCurrency: Currency = await setup.useCase
      .applyForCurrency(valueCurrency, coupon.id, null)
      .unsafeRun();
    const appliedValueForCoupon: number = await setup.useCase.applyForCentsWithCoupon(value, coupon, null).unsafeRun();
    const appliedValueCurrencyForCoupon: Currency = await setup.useCase
      .applyForCurrencyWithCoupon(valueCurrency, coupon, null)
      .unsafeRun();
    const updatedCoupon: CouponDto = await setup.repositories.coupon.getById(coupon.id);

    /** - Test - */
    expect(updatedCoupon).toEqual({ ...coupon, rules: { ...coupon.rules, limitUsage: 0 }, status: true });
    expect(appliedValue).toBe(90_00);
    expect(appliedValueCurrency.toInt()).toBe(90_00);
    expect(appliedValueForCoupon).toBe(90_00);
    expect(appliedValueCurrencyForCoupon.toInt()).toBe(90_00);
  });

  test('Applying a coupon with percent and value discount', async () => {
    /** - Setup - */
    const value: number = 100_00;
    const valueCurrency: Currency = setup.utils.currency.numToCurrency(value, Currency.CENTS_PRECISION);

    const coupon: CouponDto = await setup.repositories.coupon.insert({
      status: true,
      code: 'coupon',
      rules: {
        discountValueInCents: 10_00,
        discountPercentage: 5,
        minValueToApplyInCents: null,
        expirationDate: null,
        limitUsage: 2,
        usageMaxToUser: 0,
        authorized: undefined,
      },
    });

    /** - Run - */
    const appliedValue: number = await setup.useCase.applyForCents(value, coupon.id, null).unsafeRun();
    const appliedValueCurrency: Currency = await setup.useCase
      .applyForCurrency(valueCurrency, coupon.id, null)
      .unsafeRun();
    const appliedValueForCoupon: number = await setup.useCase.applyForCentsWithCoupon(value, coupon, null).unsafeRun();
    const appliedValueCurrencyForCoupon: Currency = await setup.useCase
      .applyForCurrencyWithCoupon(valueCurrency, coupon, null)
      .unsafeRun();

    /** - Test - */
    expect(appliedValue).toBe(95_00);
    expect(appliedValueCurrency.toInt()).toBe(95_00);
    expect(appliedValueForCoupon).toBe(95_00);
    expect(appliedValueCurrencyForCoupon.toInt()).toBe(95_00);
  });

  test('Applying a expired coupon', async () => {
    /** - Setup - */
    const value: number = 100_00;
    const valueCurrency: Currency = setup.utils.currency.numToCurrency(value, Currency.CENTS_PRECISION);

    const coupon: CouponDto = await setup.repositories.coupon.insert({
      status: true,
      code: 'coupon',
      rules: {
        discountValueInCents: 10_00,
        discountPercentage: 0,
        minValueToApplyInCents: null,
        expirationDate: new Date('01/01/2020').toISOString(),
        limitUsage: 2,
        usageMaxToUser: 0,
        authorized: undefined,
      },
    });

    /** - Run - */
    const applingValue: Promise<number> = setup.useCase.applyForCents(value, coupon.id, null).unsafeRun();
    const applingValueCurrency: Promise<Currency> = setup.useCase
      .applyForCurrency(valueCurrency, coupon.id, null)
      .unsafeRun();
    const applingValueForCoupon: Promise<number> = setup.useCase
      .applyForCentsWithCoupon(value, coupon, null)
      .unsafeRun();
    const applingValueCurrencyForCoupon: Promise<Currency> = setup.useCase
      .applyForCurrencyWithCoupon(valueCurrency, coupon, null)
      .unsafeRun();

    /** - Test - */
    await Promise.all([
      expect(applingValue).rejects.toThrow(CouponExpiredDomainError),
      expect(applingValueCurrency).rejects.toThrow(CouponExpiredDomainError),
      expect(applingValueForCoupon).rejects.toThrow(CouponExpiredDomainError),
      expect(applingValueCurrencyForCoupon).rejects.toThrow(CouponExpiredDomainError),
    ]);
  });

  test('Applying disabled coupon', async () => {
    /** - Setup - */
    const value: number = 100_00;
    const valueCurrency: Currency = setup.utils.currency.numToCurrency(value, Currency.CENTS_PRECISION);

    const coupon: CouponDto = await setup.repositories.coupon.insert({
      status: false,
      code: 'coupon',
      rules: {
        discountValueInCents: 10_00,
        discountPercentage: 0,
        minValueToApplyInCents: null,
        expirationDate: null,
        limitUsage: 2,
        usageMaxToUser: 0,
        authorized: undefined,
      },
    });

    /** - Run - */
    const applingValue: Promise<number> = setup.useCase.applyForCents(value, coupon.id, null).unsafeRun();
    const applingValueCurrency: Promise<Currency> = setup.useCase
      .applyForCurrency(valueCurrency, coupon.id, null)
      .unsafeRun();
    const applingValueForCoupon: Promise<number> = setup.useCase
      .applyForCentsWithCoupon(value, coupon, null)
      .unsafeRun();
    const applingValueCurrencyForCoupon: Promise<Currency> = setup.useCase
      .applyForCurrencyWithCoupon(valueCurrency, coupon, null)
      .unsafeRun();

    /** - Test - */
    await Promise.all([
      expect(applingValue).rejects.toThrow(CouponExpiredDomainError),
      expect(applingValueCurrency).rejects.toThrow(CouponExpiredDomainError),
      expect(applingValueForCoupon).rejects.toThrow(CouponExpiredDomainError),
      expect(applingValueCurrencyForCoupon).rejects.toThrow(CouponExpiredDomainError),
    ]);
  });

  test('Applying a coupon without usages remaining', async () => {
    /** - Setup - */
    const value: number = 100_00;
    const valueCurrency: Currency = setup.utils.currency.numToCurrency(value, Currency.CENTS_PRECISION);

    const coupon: CouponDto = await setup.repositories.coupon.insert({
      status: true,
      code: 'coupon',
      rules: {
        discountValueInCents: 10_00,
        discountPercentage: 0,
        minValueToApplyInCents: null,
        expirationDate: null,
        limitUsage: 1,
        usageMaxToUser: 0,
        authorized: undefined,
      },
    });

    /** - Run - */
    const beforeValue: number = await setup.useCase.applyForCents(value, coupon.id, null).unsafeRun();
    const updatedCoupon: CouponDto = await setup.repositories.coupon.getById(coupon.id);

    const applingValue: Promise<number> = setup.useCase.applyForCents(value, updatedCoupon.id, null).unsafeRun();
    const applingValueCurrency: Promise<Currency> = setup.useCase
      .applyForCurrency(valueCurrency, updatedCoupon.id, null)
      .unsafeRun();
    const applingValueForCoupon: Promise<number> = setup.useCase
      .applyForCentsWithCoupon(value, updatedCoupon, null)
      .unsafeRun();
    const applingValueCurrencyForCoupon: Promise<Currency> = setup.useCase
      .applyForCurrencyWithCoupon(valueCurrency, updatedCoupon, null)
      .unsafeRun();

    /** - Test - */
    expect(beforeValue).toBe(90_00);
    await Promise.all([
      expect(applingValue).rejects.toThrow(CouponExpiredDomainError),
      expect(applingValueCurrency).rejects.toThrow(CouponExpiredDomainError),
      expect(applingValueForCoupon).rejects.toThrow(CouponExpiredDomainError),
      expect(applingValueCurrencyForCoupon).rejects.toThrow(CouponExpiredDomainError),
    ]);
  });

  test('Applying a percentage coupon with a valid min value', async () => {
    /** - Setup - */
    const value: number = 100_00;
    const valueCurrency: Currency = setup.utils.currency.numToCurrency(value, Currency.CENTS_PRECISION);

    const coupon: CouponDto = await setup.repositories.coupon.insert({
      status: true,
      code: 'coupon',
      rules: {
        discountValueInCents: 0,
        discountPercentage: 10,
        minValueToApplyInCents: 200_00,
        expirationDate: null,
        limitUsage: 2,
        usageMaxToUser: 0,
        authorized: undefined,
      },
    });

    /** - Run - */
    const appliedValue: Promise<number> = setup.useCase.applyForCents(value, coupon.id, null).unsafeRun();
    const appliedValueCurrency: Promise<Currency> = setup.useCase
      .applyForCurrency(valueCurrency, coupon.id, null)
      .unsafeRun();
    const appliedValueForCoupon: Promise<number> = setup.useCase
      .applyForCentsWithCoupon(value, coupon, null)
      .unsafeRun();
    const appliedValueCurrencyForCoupon: Promise<Currency> = setup.useCase
      .applyForCurrencyWithCoupon(valueCurrency, coupon, null)
      .unsafeRun();

    /** - Test - */
    await Promise.all([
      expect(appliedValue).rejects.toThrow(CouponMinValueNotReachedDomainError),
      expect(appliedValueCurrency).rejects.toThrow(CouponMinValueNotReachedDomainError),
      expect(appliedValueForCoupon).rejects.toThrow(CouponMinValueNotReachedDomainError),
      expect(appliedValueCurrencyForCoupon).rejects.toThrow(CouponMinValueNotReachedDomainError),
    ]);
  });

  test('Applying a value coupon with a valid min value', async () => {
    /** - Setup - */
    const value: number = 100_00;
    const valueCurrency: Currency = setup.utils.currency.numToCurrency(value, Currency.CENTS_PRECISION);

    const coupon: CouponDto = await setup.repositories.coupon.insert({
      status: true,
      code: 'coupon',
      rules: {
        discountValueInCents: 10_00,
        discountPercentage: 0,
        minValueToApplyInCents: 200_00,
        expirationDate: null,
        limitUsage: 2,
        usageMaxToUser: 0,
        authorized: undefined,
      },
    });

    /** - Run - */
    const appliedValue: Promise<number> = setup.useCase.applyForCents(value, coupon.id, null).unsafeRun();
    const appliedValueCurrency: Promise<Currency> = setup.useCase
      .applyForCurrency(valueCurrency, coupon.id, null)
      .unsafeRun();
    const appliedValueForCoupon: Promise<number> = setup.useCase
      .applyForCentsWithCoupon(value, coupon, null)
      .unsafeRun();
    const appliedValueCurrencyForCoupon: Promise<Currency> = setup.useCase
      .applyForCurrencyWithCoupon(valueCurrency, coupon, null)
      .unsafeRun();

    /** - Test - */
    await Promise.all([
      expect(appliedValue).rejects.toThrow(CouponMinValueNotReachedDomainError),
      expect(appliedValueCurrency).rejects.toThrow(CouponMinValueNotReachedDomainError),
      expect(appliedValueForCoupon).rejects.toThrow(CouponMinValueNotReachedDomainError),
      expect(appliedValueCurrencyForCoupon).rejects.toThrow(CouponMinValueNotReachedDomainError),
    ]);
  });

  test('Applying a non existing coupon', async () => {
    /** - Setup - */
    const value: number = 100_00;
    const valueCurrency: Currency = setup.utils.currency.numToCurrency(value, Currency.CENTS_PRECISION);
    const id: string = TestUtil.generateId();

    /** - Run - */
    const appliedValue: Promise<number> = setup.useCase.applyForCents(value, id, null).unsafeRun();
    const appliedValueCurrency: Promise<Currency> = setup.useCase.applyForCurrency(valueCurrency, id, null).unsafeRun();
    const appliedValueForCoupon: Promise<number> = setup.useCase.applyForCentsWithCoupon(value, null, null).unsafeRun();
    const appliedValueCurrencyForCoupon: Promise<Currency> = setup.useCase
      .applyForCurrencyWithCoupon(valueCurrency, null, null)
      .unsafeRun();

    /** - Test - */
    await Promise.all([
      expect(appliedValue).rejects.toThrow(NoCouponFoundDomainError),
      expect(appliedValueCurrency).rejects.toThrow(NoCouponFoundDomainError),
      expect(appliedValueForCoupon).rejects.toThrow(NoCouponFoundDomainError),
      expect(appliedValueCurrencyForCoupon).rejects.toThrow(NoCouponFoundDomainError),
    ]);
  });

  test('Applying a coupon to user that has payments but none were paid', async () => {
    const value: number = 100_00;
    const [, billing]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();
    const coupon: CouponDto = await setup.repositories.coupon.insert({
      status: true,
      code: 'coupon',
      rules: {
        discountValueInCents: 10_00,
        discountPercentage: 0,
        minValueToApplyInCents: null,
        expirationDate: null,
        limitUsage: 1,
        usageMaxToUser: 2,
        authorized: undefined,
      },
    });
    await setup.repositories.payment.insertMany(
      [
        { billingId: billing.id, couponId: coupon.id },
        { billingId: billing.id, couponId: coupon.id },
      ],
      null,
    );
    const applingValue: Promise<number> = setup.useCase.applyForCents(value, coupon.id, billing.id).unsafeRun();
    await expect(applingValue).resolves.toBe(9000);
  });

  test("Applying a coupon to user that exceeded it's limits", async () => {
    const value: number = 100_00;
    const [, billing]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();
    const coupon: CouponDto = await setup.repositories.coupon.insert({
      status: true,
      code: 'coupon',
      rules: {
        discountValueInCents: 10_00,
        discountPercentage: 0,
        minValueToApplyInCents: null,
        expirationDate: null,
        limitUsage: 1,
        usageMaxToUser: 2,
        authorized: undefined,
      },
    });
    await setup.repositories.payment.insertMany(
      [
        { billingId: billing.id, couponId: coupon.id, status: PaymentStatus.PAID },
        { billingId: billing.id, couponId: coupon.id, status: PaymentStatus.PAID },
      ],
      null,
    );
    const applingValue: Promise<number> = setup.useCase.applyForCents(value, coupon.id, billing.id).unsafeRun();

    await expect(applingValue).rejects.toThrow(CouponLimitForUserReachedDomainError);
  });
});
