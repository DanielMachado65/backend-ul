import {
  AddPartnerIncomingDomain,
  AddPartnerIncomingResult,
} from '../../../../domain/support/partner/add-partner-incoming.domain';
import { BillingDto } from '../../../../domain/_layer/data/dto/billing.dto';
import { CouponDto } from '../../../../domain/_layer/data/dto/coupon.dto';
import { PartnerIncomingDto } from '../../../../domain/_layer/data/dto/partner-incoming.dto';
import { PaymentDto } from '../../../../domain/_layer/data/dto/payment.dto';
import { TestSetup } from '../../../../infrastructure/testing/setup.test';
import { UserDto } from '../../../../domain/_layer/data/dto/user.dto';
import { UserType } from '../../../../domain/_entity/user.entity';

describe(AddPartnerIncomingDomain.name, () => {
  const setup: TestSetup<AddPartnerIncomingDomain> = TestSetup.run(AddPartnerIncomingDomain);

  test('Adding partner incoming when eligible', async () => {
    const insertedCreator: UserDto = await setup.factory.createUserWithOnlyRequirements({ type: UserType.PRE_PAID });
    const insertedCoupon: CouponDto = await setup.factory.createBasicCoupon({ creatorId: insertedCreator.id });

    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount();

    const insertedPayment: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
      couponId: insertedCoupon.id,
    });

    const incomingsCount1: number = await setup.repositories.partnerIncoming.count();
    const partnerIncoming: PartnerIncomingDto = await setup.useCase.addPartnerIncoming(insertedPayment.id).unsafeRun();
    const incomingsCount2: number = await setup.repositories.partnerIncoming.count();

    expect(incomingsCount1).toBe(0);
    expect(incomingsCount2).toBe(1);
    expect(partnerIncoming.couponId).toBe(insertedCoupon.id);
    expect(partnerIncoming.partnerId).toBe(insertedCreator.id);
    expect(partnerIncoming.paymentId).toBe(insertedPayment.id);
    expect(partnerIncoming.userId).toBe(insertedUser.id);
    expect(partnerIncoming.couponCode).toBe(insertedCoupon.code);
    expect(partnerIncoming.incomingRefValueCents).toBe(insertedPayment.totalPaidInCents);
  });

  test('Does not add partner incoming when no coupon', async () => {
    const [, insertedBilling]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();

    const insertedPayment: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
    });

    const incomingsCount1: number = await setup.repositories.partnerIncoming.count();
    const partnerIncoming: AddPartnerIncomingResult = await setup.useCase
      .addPartnerIncoming(insertedPayment.id)
      .safeRun();
    const incomingsCount2: number = await setup.repositories.partnerIncoming.count();

    expect(incomingsCount1).toBe(0);
    expect(incomingsCount2).toBe(0);
    expect(partnerIncoming.isRight()).toBe(true);
    expect(partnerIncoming.getRight()).toBeNull();
  });

  test('Does not add partner incoming when is internal coupon', async () => {
    const insertedCreator: UserDto = await setup.factory.createUserWithOnlyRequirements({ type: UserType.MASTER });
    const insertedCoupon: CouponDto = await setup.factory.createBasicCoupon({ creatorId: insertedCreator.id });

    const [, insertedBilling]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();

    const insertedPayment: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
      couponId: insertedCoupon.id,
    });

    const incomingsCount1: number = await setup.repositories.partnerIncoming.count();
    const partnerIncoming: AddPartnerIncomingResult = await setup.useCase
      .addPartnerIncoming(insertedPayment.id)
      .safeRun();
    const incomingsCount2: number = await setup.repositories.partnerIncoming.count();

    expect(incomingsCount1).toBe(0);
    expect(incomingsCount2).toBe(0);
    expect(partnerIncoming.isRight()).toBe(true);
    expect(partnerIncoming.getRight()).toBeNull();
  });

  test('Does not add partner incoming when user first bought without coupon', async () => {
    const [, insertedBilling]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();

    const insertedPayment1: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
    });

    const incomingsCount1: number = await setup.repositories.partnerIncoming.count();
    const partnerIncoming1: AddPartnerIncomingResult = await setup.useCase
      .addPartnerIncoming(insertedPayment1.id)
      .safeRun();
    const incomingsCount2: number = await setup.repositories.partnerIncoming.count();
    const updatedBilling1: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    const insertedCreator: UserDto = await setup.factory.createUserWithOnlyRequirements({ type: UserType.PRE_PAID });
    const insertedCoupon: CouponDto = await setup.factory.createBasicCoupon({ creatorId: insertedCreator.id });
    const insertedPayment2: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
      couponId: insertedCoupon.id,
    });

    const incomingsCount3: number = await setup.repositories.partnerIncoming.count();
    const partnerIncoming2: AddPartnerIncomingResult = await setup.useCase
      .addPartnerIncoming(insertedPayment2.id)
      .safeRun();
    const incomingsCount4: number = await setup.repositories.partnerIncoming.count();
    const updatedBilling2: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    expect(incomingsCount1).toBe(0);
    expect(incomingsCount2).toBe(0);
    expect(incomingsCount3).toBe(0);
    expect(incomingsCount4).toBe(0);
    expect(insertedBilling.orderRoles.hasUsedCouponOnFirstOrder).toBe(false);
    expect(insertedBilling.orderRoles.couponId).toBeNull();
    expect(insertedBilling.orderRoles.couponCode).toBeNull();
    expect(insertedBilling.orderRoles.isPartnerCoupon).toBeNull();
    expect(updatedBilling1.orderRoles.hasUsedCouponOnFirstOrder).toBe(false);
    expect(updatedBilling1.orderRoles.couponId).toBeNull();
    expect(updatedBilling1.orderRoles.couponCode).toBeNull();
    expect(updatedBilling1.orderRoles.isPartnerCoupon).toBe(false);
    expect(updatedBilling2.orderRoles.hasUsedCouponOnFirstOrder).toBe(false);
    expect(updatedBilling2.orderRoles.couponId).toBeNull();
    expect(updatedBilling2.orderRoles.couponCode).toBeNull();
    expect(updatedBilling2.orderRoles.isPartnerCoupon).toBe(false);
    expect(partnerIncoming1.isRight()).toBe(true);
    expect(partnerIncoming1.getRight()).toBeNull();
    expect(partnerIncoming2.isRight()).toBe(true);
    expect(partnerIncoming2.getRight()).toBeNull();
  });

  test('Does not add partner incoming when user first bought with internal coupon', async () => {
    const insertedCreator1: UserDto = await setup.factory.createUserWithOnlyRequirements({ type: UserType.MASTER });
    const insertedCoupon1: CouponDto = await setup.factory.createBasicCoupon({ creatorId: insertedCreator1.id });

    const [, insertedBilling]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();
    const insertedPayment1: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
      couponId: insertedCoupon1.id,
    });

    const incomingsCount1: number = await setup.repositories.partnerIncoming.count();
    const partnerIncoming1: AddPartnerIncomingResult = await setup.useCase
      .addPartnerIncoming(insertedPayment1.id)
      .safeRun();
    const incomingsCount2: number = await setup.repositories.partnerIncoming.count();
    const updatedBilling1: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    const insertedCreator2: UserDto = await setup.factory.createUserWithOnlyRequirements({ type: UserType.PRE_PAID });
    const insertedCoupon2: CouponDto = await setup.factory.createBasicCoupon({ creatorId: insertedCreator2.id });

    const insertedPayment2: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
      couponId: insertedCoupon2.id,
    });

    const incomingsCount3: number = await setup.repositories.partnerIncoming.count();
    const partnerIncoming2: AddPartnerIncomingResult = await setup.useCase
      .addPartnerIncoming(insertedPayment2.id)
      .safeRun();
    const incomingsCount4: number = await setup.repositories.partnerIncoming.count();
    const updatedBilling2: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    expect(incomingsCount1).toBe(0);
    expect(incomingsCount2).toBe(0);
    expect(incomingsCount3).toBe(0);
    expect(incomingsCount4).toBe(0);
    expect(insertedBilling.orderRoles.hasUsedCouponOnFirstOrder).toBe(false);
    expect(insertedBilling.orderRoles.couponId).toBeNull();
    expect(insertedBilling.orderRoles.couponCode).toBeNull();
    expect(insertedBilling.orderRoles.isPartnerCoupon).toBeNull();
    expect(updatedBilling1.orderRoles.hasUsedCouponOnFirstOrder).toBe(true);
    expect(updatedBilling1.orderRoles.couponId).toBe(insertedCoupon1.id);
    expect(updatedBilling1.orderRoles.couponCode).toBe(insertedCoupon1.code);
    expect(updatedBilling1.orderRoles.isPartnerCoupon).toBe(false);
    expect(updatedBilling2.orderRoles.hasUsedCouponOnFirstOrder).toBe(true);
    expect(updatedBilling2.orderRoles.couponId).toBe(insertedCoupon1.id);
    expect(updatedBilling2.orderRoles.couponCode).toBe(insertedCoupon1.code);
    expect(updatedBilling2.orderRoles.isPartnerCoupon).toBe(false);
    expect(partnerIncoming1.isRight()).toBe(true);
    expect(partnerIncoming1.getRight()).toBeNull();
    expect(partnerIncoming2.isRight()).toBe(true);
    expect(partnerIncoming2.getRight()).toBeNull();
  });

  test('Add partner incoming when user first bought with partner coupon', async () => {
    const insertedCreator1: UserDto = await setup.factory.createUserWithOnlyRequirements({ type: UserType.PRE_PAID });
    const insertedCoupon1: CouponDto = await setup.factory.createBasicCoupon({ creatorId: insertedCreator1.id });

    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount();
    const insertedPayment1: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
      couponId: insertedCoupon1.id,
    });

    const incomingsCount1: number = await setup.repositories.partnerIncoming.count();
    const partnerIncoming1: AddPartnerIncomingResult = await setup.useCase
      .addPartnerIncoming(insertedPayment1.id)
      .safeRun();
    const incomingsCount2: number = await setup.repositories.partnerIncoming.count();
    const updatedBilling1: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    const insertedCreator2: UserDto = await setup.factory.createUserWithOnlyRequirements({ type: UserType.PRE_PAID });
    const insertedCoupon2: CouponDto = await setup.factory.createBasicCoupon({ creatorId: insertedCreator2.id });

    const insertedPayment2: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
      couponId: insertedCoupon2.id,
    });

    const incomingsCount3: number = await setup.repositories.partnerIncoming.count();
    const partnerIncoming2: AddPartnerIncomingResult = await setup.useCase
      .addPartnerIncoming(insertedPayment2.id)
      .safeRun();
    const incomingsCount4: number = await setup.repositories.partnerIncoming.count();
    const updatedBilling2: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    expect(incomingsCount1).toBe(0);
    expect(incomingsCount2).toBe(1);
    expect(incomingsCount3).toBe(1);
    expect(incomingsCount4).toBe(2);
    expect(insertedBilling.orderRoles.hasUsedCouponOnFirstOrder).toBe(false);
    expect(insertedBilling.orderRoles.couponId).toBeNull();
    expect(insertedBilling.orderRoles.couponCode).toBeNull();
    expect(insertedBilling.orderRoles.isPartnerCoupon).toBeNull();
    expect(updatedBilling1.orderRoles.hasUsedCouponOnFirstOrder).toBe(true);
    expect(updatedBilling1.orderRoles.couponId).toBe(insertedCoupon1.id);
    expect(updatedBilling1.orderRoles.couponCode).toBe(insertedCoupon1.code);
    expect(updatedBilling1.orderRoles.isPartnerCoupon).toBe(true);
    expect(updatedBilling2.orderRoles.hasUsedCouponOnFirstOrder).toBe(true);
    expect(updatedBilling2.orderRoles.couponId).toBe(insertedCoupon1.id);
    expect(updatedBilling2.orderRoles.couponCode).toBe(insertedCoupon1.code);
    expect(updatedBilling2.orderRoles.isPartnerCoupon).toBe(true);
    expect(partnerIncoming1.getRight().couponId).toBe(insertedCoupon1.id);
    expect(partnerIncoming1.getRight().partnerId).toBe(insertedCreator1.id);
    expect(partnerIncoming1.getRight().paymentId).toBe(insertedPayment1.id);
    expect(partnerIncoming1.getRight().userId).toBe(insertedUser.id);
    expect(partnerIncoming1.getRight().couponCode).toBe(insertedCoupon1.code);
    expect(partnerIncoming1.getRight().incomingRefValueCents).toBe(insertedPayment1.totalPaidInCents);
    expect(partnerIncoming2.getRight().couponId).toBe(insertedCoupon2.id);
    expect(partnerIncoming2.getRight().partnerId).toBe(insertedCreator2.id);
    expect(partnerIncoming2.getRight().paymentId).toBe(insertedPayment2.id);
    expect(partnerIncoming2.getRight().userId).toBe(insertedUser.id);
    expect(partnerIncoming2.getRight().couponCode).toBe(insertedCoupon2.code);
    expect(partnerIncoming2.getRight().incomingRefValueCents).toBe(insertedPayment2.totalPaidInCents);
  });
});
