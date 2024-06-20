import { Either } from '@alissonfpmorais/minimal_fp';
import { PaymentFillingOrder, PaymentSplittingType } from 'src/domain/_entity/payment-management.entity';
import { PaymentStatus, PaymentType } from 'src/domain/_entity/payment.entity';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { CartDto } from 'src/domain/_layer/data/dto/cart.dto';
import { CouponDto } from 'src/domain/_layer/data/dto/coupon.dto';
import { PackageDto } from 'src/domain/_layer/data/dto/package.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { PriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { PaymentWithPixDomain } from 'src/domain/support/payment/payment-with-pix.domain';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(PaymentWithPixDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<PaymentWithPixDomain> = TestSetup.run(PaymentWithPixDomain);
  const nowDate: Date = new Date('2000');
  const userRef: string = TestUtil.generateId();
  const cnpj1: string = '11222333444455';
  const cnpj2: string = '22333444555566';
  const reqParentId: string = 'reqParentId';

  let user: UserDto = null;

  beforeAll(() => {
    jest.useFakeTimers({
      now: nowDate,
      doNotFake: ['nextTick'],
    }); // modern freezes tests
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    await setup.repositories.paymentManagement.insert({
      id: TestUtil.generateId(),
      splittingType: PaymentSplittingType.ABSOLUTE,
      fillingOrder: PaymentFillingOrder.RANDOM,
      rules: [
        {
          cnpj: cnpj1,
          fillOrder: 1,
          maxValueCents: 100000,
        },
      ],
      createdAt: new Date(0).toISOString(),
    });

    user = await setup.factory.createUserWithOnlyRequirements({
      externalControls: {
        arc: { id: userRef, tenants: [{ id: userRef, cnpj: cnpj1 }] },
        asaas: { id: TestUtil.generateId() },
        iugu: { id: TestUtil.generateId() },
      },
    });
  });

  test('Create pix payment', async () => {
    /** - Setup - */
    const QUERY_PRICE: number = 100_00;
    const PACKAGE_PURCHASE_PRICE: number = 150_00;
    const PACKAGE_ATTRIBUTED_VALUE: number = 200_00;
    const INSERTED_QUERY_AMOUNT: number = 10;
    const INSERTED_PACKAGE_AMOUNT: number = 10;
    const QUERY_AMOUNT_FOR_EACH: number = 2;
    const PACKAGE_AMOUNT_FOR_EACH: number = 2;

    // package
    const insertedPackages: ReadonlyArray<PackageDto> = await setup.factory
      .__generateMany__(INSERTED_PACKAGE_AMOUNT)
      .createEmptyPackage({
        purchasePriceInCents: PACKAGE_PURCHASE_PRICE,
        attributedValueInCents: PACKAGE_ATTRIBUTED_VALUE,
      });

    // query composers
    const insertedQueryComposers: ReadonlyArray<QueryComposerDto> = await setup.factory
      .__generateMany__(INSERTED_QUERY_AMOUNT)
      .createEmptyQueryComposer();

    // subscriptions
    const subscriptions: readonly [] = [];

    // price table
    const priceTable: PriceTableDto = await setup.factory.createEmptyPriceTable({
      template: insertedQueryComposers.map((query: QueryComposerDto) => {
        return {
          queryCode: query.queryCode,
          totalPriceCents: QUERY_PRICE,
          oldPriceCents: 50_00,
          queryComposerId: query.id,
        };
      }),
    });

    // user & billing
    const insertedBilling: BillingDto = await setup.factory.createDissociatedEmptyBilling({
      userId: user.id,
      priceTableId: priceTable.id,
    });

    const insertedUser: UserDto = await setup.repositories.user.updateById(user.id, { billingId: insertedBilling.id });

    // cart
    const cart: CartDto = {
      coupon: null,
      products: {
        packages: insertedPackages.map((pack: PackageDto) => ({ code: pack.id, amount: PACKAGE_AMOUNT_FOR_EACH })),
        queries: insertedQueryComposers.map((query: QueryComposerDto) => ({
          code: query.queryCode.toString(),
          amount: QUERY_AMOUNT_FOR_EACH,
        })),
        subscriptions: subscriptions,
      },
    };

    // jest mock
    const externalPaymentId: string = '::external::';
    jest
      .spyOn(setup.servicesMocks.paymentGatewayService, 'paymentWithPix')
      .mockImplementation(async () => Either.right(externalPaymentId));

    /** - Run - */
    const payment: PaymentDto = await setup.useCase.paymentWithPix(insertedUser.id, cart, reqParentId).unsafeRun();

    /** - Test - */
    const expectedPayment: Partial<PaymentDto> = {
      gateway: setup.servicesMocks.paymentGatewayService.gateway,
      billingId: insertedBilling.id,
      couponId: null,
      // items: [],
      status: PaymentStatus.PENDING,
      totalPriceWithDiscountInCents:
        QUERY_PRICE * INSERTED_QUERY_AMOUNT * QUERY_AMOUNT_FOR_EACH +
        PACKAGE_PURCHASE_PRICE * INSERTED_PACKAGE_AMOUNT * PACKAGE_AMOUNT_FOR_EACH,
      totalPaidInCents: 0,
      realPriceInCents:
        QUERY_PRICE * INSERTED_QUERY_AMOUNT * QUERY_AMOUNT_FOR_EACH +
        PACKAGE_ATTRIBUTED_VALUE * INSERTED_PACKAGE_AMOUNT * PACKAGE_AMOUNT_FOR_EACH,
      paid: false,
      type: PaymentType.PIX,
      refMonth: nowDate.getMonth(),
      refYear: nowDate.getFullYear(),
      cnpj: cnpj1,
    };
    expect(payment).toMatchObject(expectedPayment);
    expect(payment.chargeId).toBe(null);
    expect(payment.paymentExternalRef).toBe(externalPaymentId);
  });

  test('Create pix payment with coupon percentage', async () => {
    /** - Setup - */
    const QUERY_PRICE: number = 100_00;
    const PACKAGE_PURCHASE_PRICE: number = 150_00;
    const PACKAGE_ATTRIBUTED_VALUE: number = 200_00;
    const INSERTED_QUERY_AMOUNT: number = 10;
    const INSERTED_PACKAGE_AMOUNT: number = 10;
    const QUERY_AMOUNT_FOR_EACH: number = 2;
    const PACKAGE_AMOUNT_FOR_EACH: number = 2;

    // coupon
    const insertedCoupon: CouponDto = await setup.repositories.coupon.insert({
      code: 'coupon',
      status: true,
      rules: {
        discountPercentage: 10,
        discountValueInCents: null,
        minValueToApplyInCents: 0,
        expirationDate: null,
        limitUsage: 9999,
        usageMaxToUser: 9999,
        authorized: null,
      },
    });

    // package
    const insertedPackages: ReadonlyArray<PackageDto> = await setup.factory
      .__generateMany__(INSERTED_PACKAGE_AMOUNT)
      .createEmptyPackage({
        purchasePriceInCents: PACKAGE_PURCHASE_PRICE,
        attributedValueInCents: PACKAGE_ATTRIBUTED_VALUE,
      });

    // query composer
    const insertedQueryComposers: ReadonlyArray<QueryComposerDto> = await setup.factory
      .__generateMany__(INSERTED_QUERY_AMOUNT)
      .createEmptyQueryComposer();

    // pricetable
    const priceTable: PriceTableDto = await setup.factory.createEmptyPriceTable({
      template: insertedQueryComposers.map((query: QueryComposerDto) => {
        return {
          queryCode: query.queryCode,
          totalPriceCents: QUERY_PRICE,
          oldPriceCents: 50_00,
          queryComposerId: query.id,
        };
      }),
    });

    // user & billing
    const insertedBilling: BillingDto = await setup.factory.createDissociatedEmptyBilling({
      userId: user.id,
      priceTableId: priceTable.id,
    });

    const insertedUser: UserDto = await setup.repositories.user.updateById(user.id, { billingId: insertedBilling.id });

    // cart
    const cart: CartDto = {
      coupon: insertedCoupon.code,
      products: {
        packages: insertedPackages.map((pack: PackageDto) => ({ code: pack.id, amount: PACKAGE_AMOUNT_FOR_EACH })),
        queries: insertedQueryComposers.map((query: QueryComposerDto) => ({
          code: query.queryCode.toString(),
          amount: QUERY_AMOUNT_FOR_EACH,
        })),
        subscriptions: [],
      },
    };

    // jest mock
    const externalPaymentId: string = '::external::';
    jest
      .spyOn(setup.servicesMocks.paymentGatewayService, 'paymentWithPix')
      .mockImplementation(async () => Either.right(externalPaymentId));

    /** - Run - */
    const payment: PaymentDto = await setup.useCase.paymentWithPix(insertedUser.id, cart, reqParentId).unsafeRun();

    /** - Test - */
    const total: number =
      QUERY_PRICE * INSERTED_QUERY_AMOUNT * QUERY_AMOUNT_FOR_EACH +
      PACKAGE_PURCHASE_PRICE * INSERTED_PACKAGE_AMOUNT * PACKAGE_AMOUNT_FOR_EACH;
    const percent: number = (100 - insertedCoupon.rules.discountPercentage) / 100;

    const expectedPayment: Partial<PaymentDto> = {
      gateway: setup.servicesMocks.paymentGatewayService.gateway,
      billingId: insertedBilling.id,
      couponId: insertedCoupon.id,
      // items: [],
      status: PaymentStatus.PENDING,
      totalPriceWithDiscountInCents: total * percent,
      totalPaidInCents: 0,
      realPriceInCents:
        QUERY_PRICE * INSERTED_QUERY_AMOUNT * QUERY_AMOUNT_FOR_EACH +
        PACKAGE_ATTRIBUTED_VALUE * INSERTED_PACKAGE_AMOUNT * PACKAGE_AMOUNT_FOR_EACH,
      paid: false,
      type: PaymentType.PIX,
      refMonth: nowDate.getMonth(),
      refYear: nowDate.getFullYear(),
      cnpj: cnpj1,
    };
    expect(payment).toMatchObject(expectedPayment);
    expect(payment.chargeId).toBe(null);
    expect(payment.paymentExternalRef).toBe(externalPaymentId);
  });

  test("Ensure pix payment if user doesn't have all tenants registered", async () => {
    /** - Setup - */
    const QUERY_PRICE: number = 100_00;
    const PACKAGE_PURCHASE_PRICE: number = 150_00;
    const PACKAGE_ATTRIBUTED_VALUE: number = 200_00;
    const INSERTED_QUERY_AMOUNT: number = 10;
    const INSERTED_PACKAGE_AMOUNT: number = 10;
    const QUERY_AMOUNT_FOR_EACH: number = 2;
    const PACKAGE_AMOUNT_FOR_EACH: number = 2;
    const USER_REF2: string = TestUtil.generateId();

    // package
    const insertedPackages: ReadonlyArray<PackageDto> = await setup.factory
      .__generateMany__(INSERTED_PACKAGE_AMOUNT)
      .createEmptyPackage({
        purchasePriceInCents: PACKAGE_PURCHASE_PRICE,
        attributedValueInCents: PACKAGE_ATTRIBUTED_VALUE,
      });

    // query composers
    const insertedQueryComposers: ReadonlyArray<QueryComposerDto> = await setup.factory
      .__generateMany__(INSERTED_QUERY_AMOUNT)
      .createEmptyQueryComposer();

    // subscriptions
    const subscriptions: readonly [] = [];

    // price table
    const priceTable: PriceTableDto = await setup.factory.createEmptyPriceTable({
      template: insertedQueryComposers.map((query: QueryComposerDto) => {
        return {
          queryCode: query.queryCode,
          totalPriceCents: QUERY_PRICE,
          oldPriceCents: 50_00,
          queryComposerId: query.id,
        };
      }),
    });

    // payment management
    await setup.repositories.paymentManagement.insert({
      id: TestUtil.generateId(),
      splittingType: PaymentSplittingType.ABSOLUTE,
      fillingOrder: PaymentFillingOrder.SEQUENTIAL,
      rules: [
        { cnpj: cnpj1, fillOrder: 1, maxValueCents: 100000 },
        { cnpj: cnpj2, fillOrder: 2, maxValueCents: 200000 },
      ],
    });

    // user & billing
    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount({
        user: {
          externalControls: {
            arc: {
              id: USER_REF2,
              tenants: [
                { id: null, cnpj: cnpj1 },
                { id: USER_REF2, cnpj: cnpj2 },
              ],
            },
            asaas: { id: TestUtil.generateId() },
            iugu: { id: TestUtil.generateId() },
          },
        },
        billing: { priceTableId: priceTable.id },
      });

    // cart
    const cart: CartDto = {
      coupon: null,
      products: {
        packages: insertedPackages.map((pack: PackageDto) => ({ code: pack.id, amount: PACKAGE_AMOUNT_FOR_EACH })),
        queries: insertedQueryComposers.map((query: QueryComposerDto) => ({
          code: query.queryCode.toString(),
          amount: QUERY_AMOUNT_FOR_EACH,
        })),
        subscriptions: subscriptions,
      },
    };

    // jest mock
    const externalPaymentId: string = '::external::';
    jest
      .spyOn(setup.servicesMocks.paymentGatewayService, 'paymentWithPix')
      .mockImplementation(async () => Either.right(externalPaymentId));

    /** - Run - */
    const payment: PaymentDto = await setup.useCase.paymentWithPix(insertedUser.id, cart, reqParentId).unsafeRun();

    /** - Test - */
    const expectedPayment: Partial<PaymentDto> = {
      gateway: setup.servicesMocks.paymentGatewayService.gateway,
      billingId: insertedBilling.id,
      couponId: null,
      // items: [],
      status: PaymentStatus.PENDING,
      totalPriceWithDiscountInCents:
        QUERY_PRICE * INSERTED_QUERY_AMOUNT * QUERY_AMOUNT_FOR_EACH +
        PACKAGE_PURCHASE_PRICE * INSERTED_PACKAGE_AMOUNT * PACKAGE_AMOUNT_FOR_EACH,
      totalPaidInCents: 0,
      realPriceInCents:
        QUERY_PRICE * INSERTED_QUERY_AMOUNT * QUERY_AMOUNT_FOR_EACH +
        PACKAGE_ATTRIBUTED_VALUE * INSERTED_PACKAGE_AMOUNT * PACKAGE_AMOUNT_FOR_EACH,
      paid: false,
      type: PaymentType.PIX,
      refMonth: nowDate.getMonth(),
      refYear: nowDate.getFullYear(),
      cnpj: cnpj2,
    };
    expect(payment).toMatchObject(expectedPayment);
    expect(payment.chargeId).toBe(null);
    expect(payment.paymentExternalRef).toBe(externalPaymentId);
  });
});
