import { BillingDto } from '../../../../domain/_layer/data/dto/billing.dto';
import { CouponDto } from '../../../../domain/_layer/data/dto/coupon.dto';
import { PaymentDto } from '../../../../domain/_layer/data/dto/payment.dto';
import {
  PaymentEventDto,
  PaymentEventItemDto,
  TagManagerDto,
} from '../../../../domain/_layer/infrastructure/service/tag-manager.service';
import { PaymentType } from '../../../../domain/_entity/payment.entity';
import { SendPaymentToTagManagerDomain } from '../../../../domain/support/marketing/send-payment-to-tag-manager.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { TestUtil } from '../../../../infrastructure/repository/test/test.util';
import { UserDto } from '../../../../domain/_layer/data/dto/user.dto';

type MockFnParams = {
  readonly user: UserDto;
  readonly payment: PaymentDto;
  readonly couponName: string;
  readonly hasSent: boolean;
};

describe(SendPaymentToTagManagerDomain.name, () => {
  const setup: TestSetup<SendPaymentToTagManagerDomain> = TestSetup.run(SendPaymentToTagManagerDomain);

  const queryId: string = TestUtil.generateId();
  const totalPaidInCents: number = 1234;
  const productName: string = 'Mithril';
  const productAmount: number = 2;
  const userParams: Partial<UserDto> = {
    name: 'Gandalf',
    email: 'gandalf_the_gray@email.com',
  };
  const paymentParams: Partial<PaymentDto> = {
    couponId: null,
    type: PaymentType.CREDIT_CARD,
    totalPaidInCents: totalPaidInCents,
    items: [
      {
        queryId: queryId,
        packageId: null,
        signatureId: null,
        name: productName,
        amount: productAmount,
        unitValueInCents: totalPaidInCents / productAmount,
        totalValueInCents: totalPaidInCents,
      },
    ],
  };
  const mockFn: (params: MockFnParams) => (dto: TagManagerDto<PaymentEventDto>) => Promise<boolean> =
    ({ user, payment, couponName, hasSent }: MockFnParams) =>
    async (dto: TagManagerDto<PaymentEventDto>): Promise<boolean> => {
      const event: PaymentEventDto = dto.events[0];
      const item: PaymentEventItemDto = event.items[0];

      expect(dto.userId).toBe(user.id);
      expect(dto.userEmail).toBe(userParams.email);
      expect(dto.events.length).toBe(1);
      expect(event.paymentId).toBe(payment.id);
      expect(event.paymentType).toBe(PaymentType.CREDIT_CARD);
      expect(event.totalPaidInCents).toBe(totalPaidInCents);
      expect(event.couponName).toBe(couponName);
      expect(event.items.length).toBe(1);
      expect(item.productId).toBe(queryId);
      expect(item.productName).toBe(productName);
      expect(item.amount).toBe(productAmount);
      expect(item.unitPriceInCents).toBe(totalPaidInCents / productAmount);

      return hasSent;
    };

  test('Send payment with coupon to tag manager', async () => {
    const couponCode: string = 'MELLON';
    const [user, billing]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      user: userParams,
    });
    const coupon: CouponDto = await setup.factory.createBasicCoupon({ code: couponCode });
    const payment: PaymentDto = await setup.factory.createBasicPayment({
      ...paymentParams,
      billingId: billing.id,
      couponId: coupon.id,
    });

    const spyDispatchPaymentSucceed: jest.SpyInstance = jest
      .spyOn(setup.servicesMocks.tagManagerService, 'dispatchPaymentSucceed')
      .mockImplementation(
        mockFn({
          user,
          payment,
          couponName: couponCode,
          hasSent: true,
        }),
      );

    const hasSent: boolean = await setup.useCase.send(payment.id).unsafeRun();

    expect(hasSent).toBe(true);
    expect(spyDispatchPaymentSucceed.mock.calls.length).toBe(1);
  });

  test('Send payment without coupon to tag manager', async () => {
    const [user, billing]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      user: userParams,
    });
    const payment: PaymentDto = await setup.factory.createBasicPayment({
      ...paymentParams,
      billingId: billing.id,
    });

    const spyDispatchPaymentSucceed: jest.SpyInstance = jest
      .spyOn(setup.servicesMocks.tagManagerService, 'dispatchPaymentSucceed')
      .mockImplementation(
        mockFn({
          user,
          payment,
          couponName: null,
          hasSent: true,
        }),
      );

    const hasSent: boolean = await setup.useCase.send(payment.id).unsafeRun();

    expect(hasSent).toBe(true);
    expect(spyDispatchPaymentSucceed.mock.calls.length).toBe(1);
  });

  test('Send payment but service fails', async () => {
    const [user, billing]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      user: userParams,
    });
    const payment: PaymentDto = await setup.factory.createBasicPayment({
      ...paymentParams,
      billingId: billing.id,
    });

    const spyDispatchPaymentSucceed: jest.SpyInstance = jest
      .spyOn(setup.servicesMocks.tagManagerService, 'dispatchPaymentSucceed')
      .mockImplementation(
        mockFn({
          user,
          payment,
          couponName: null,
          hasSent: false,
        }),
      );

    const hasSent: boolean = await setup.useCase.send(payment.id).unsafeRun();

    expect(hasSent).toBe(false);
    expect(spyDispatchPaymentSucceed.mock.calls.length).toBe(1);
  });
});
