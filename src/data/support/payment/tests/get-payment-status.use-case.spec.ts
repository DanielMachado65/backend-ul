import { GetPaymentStatusDomain } from 'src/domain/support/payment/get-payment-status.domain';
import { BillingType } from 'src/domain/_entity/billing.entity';
import { NoPaymentFoundDomainError } from 'src/domain/_entity/result.error';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { PaymentStatusDto } from '../../../../domain/_layer/data/dto/payment-status.dto';

describe(GetPaymentStatusDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<GetPaymentStatusDomain> = TestSetup.run(GetPaymentStatusDomain);

  test('Get payment status', async () => {
    /** - Setup - */
    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount();
    const insertedPayment: PaymentDto = await setup.repositories.payment.insert({
      billingId: insertedBilling.id,
      pix: { qrcode: '', qrcodeText: '' },
    });

    /** - Run - */
    const paymentStatus: PaymentStatusDto = await setup.useCase
      .getPaymentStatus(insertedUser.id, insertedPayment.id)
      .unsafeRun();

    /** - Test - */
    const expectedStatus: PaymentStatusDto = {
      id: insertedPayment.id,
      status: insertedPayment.status,
      type: insertedPayment.type,
      pix: insertedPayment.pix,
      bankingBillet: insertedPayment.bankingBillet,
    };
    expect(paymentStatus).toStrictEqual(expectedStatus);
  });

  test("Try get status of a payment that doesn't exist", async () => {
    /** - Setup - */
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();

    /** - Run - */
    const paymentStatus: Promise<PaymentStatusDto> = setup.useCase
      .getPaymentStatus(insertedUser.id, TestUtil.generateId())
      .unsafeRun();

    /** - Test - */
    await expect(paymentStatus).rejects.toThrow(NoPaymentFoundDomainError);
  });

  test("Try get status of a payment from which user doesn't exist", async () => {
    /** - Setup - */
    const insertedBilling: BillingDto = await setup.repositories.billing.insert({ billingType: BillingType.PRE_PAID });
    const insertedPayment: PaymentDto = await setup.repositories.payment.insert({ billingId: insertedBilling.id });

    /** - Run - */
    const paymentStatus: Promise<PaymentStatusDto> = setup.useCase
      .getPaymentStatus(TestUtil.generateId(), insertedPayment.id)
      .unsafeRun();

    /** - Test - */
    await expect(paymentStatus).rejects.toThrow(NoPaymentFoundDomainError);
  });
});
