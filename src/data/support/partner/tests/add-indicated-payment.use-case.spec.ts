import { TestSetup } from '../../../../infrastructure/testing/setup.test';
import { AddIndicatedPaymentDomain } from '../../../../domain/support/partner/add-indicator-incoming.domain';
import { BillingDto } from '../../../../domain/_layer/data/dto/billing.dto';
import { UserDto } from '../../../../domain/_layer/data/dto/user.dto';
import { PaymentDto } from '../../../../domain/_layer/data/dto/payment.dto';

describe(AddIndicatedPaymentDomain.name, () => {
  const setup: TestSetup<AddIndicatedPaymentDomain> = TestSetup.run(AddIndicatedPaymentDomain);

  test('Add indicated payment when user was indicated', async () => {
    const [, billing]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();
    const payment: PaymentDto = await setup.factory.createBasicPayment({ billingId: billing.id });
    const spyAddTransactionCredit: jest.SpyInstance = jest
      .spyOn(setup.servicesMocks.indicateAndEarnService, 'addTransactionCredit')
      .mockImplementation(() => Promise.resolve(undefined));

    const hasAdded: boolean = await setup.useCase.addIndicatedPayment(payment.id).unsafeRun();

    expect(hasAdded).toBe(true);
    expect(spyAddTransactionCredit.mock.calls.length).toBe(1);
  });

  test('Does not add indicated payment when user was not indicated', async () => {
    const [, billing]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();
    const payment: PaymentDto = await setup.factory.createBasicPayment({ billingId: billing.id });
    const spyAddTransactionCredit: jest.SpyInstance = jest
      .spyOn(setup.servicesMocks.indicateAndEarnService, 'addTransactionCredit')
      .mockImplementation(() => Promise.reject(new Error()));

    const hasAdded: boolean = await setup.useCase.addIndicatedPayment(payment.id).unsafeRun();

    expect(hasAdded).toBe(false);
    expect(spyAddTransactionCredit.mock.calls.length).toBe(1);
  });
});
