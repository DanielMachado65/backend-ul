import { AddUserCreditsDomain } from 'src/domain/support/billing/add-user-credits.domain';
import { PaymentStatus } from 'src/domain/_entity/payment.entity';
import {
  CreditsAlreadyAddedDomainError,
  InvalidPaymentStateForOperationDomainError,
  NoCreditsAddedDomainError,
  NoUserFoundDomainError,
} from 'src/domain/_entity/result.error';
import { BalanceDto } from 'src/domain/_layer/data/dto/balance.dto';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(AddUserCreditsDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<AddUserCreditsDomain> = TestSetup.run(AddUserCreditsDomain);

  test('Adding credits from user', async () => {
    /** - Test - */
    const initialBalance: number = 300_000;
    const toAdd: number = 20_000;

    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount({ billing: { accountFundsCents: initialBalance } });
    await setup.repositories.balance.insert({
      currentBalanceCents: initialBalance,
      lastBalanceCents: initialBalance,
      userId: insertedUser.id,
    });

    /** - Run - */
    const resultBalance: BalanceDto = await setup.useCase.addUserCredits(toAdd, insertedUser.id).unsafeRun();
    const resultBilling: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    /** - Test - */
    expect(resultBalance.currentBalanceCents).toBe(initialBalance + toAdd);
    expect(resultBilling.accountFundsCents).toBe(initialBalance + toAdd);
  });

  test('Adding credits from user with invalid value', async () => {
    /** - Setup - */
    const initialBalance: number = 300_000;
    const toAdd: number = -10_000;

    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount({ billing: { accountFundsCents: initialBalance } });
    const insertedBalance: BalanceDto = await setup.repositories.balance.insert({
      currentBalanceCents: initialBalance,
      userId: insertedUser.id,
    });

    await setup.useCase.addUserCredits(toAdd, insertedUser.id).unsafeRun();

    /** - Run - */
    const resultBalance: BalanceDto = await setup.repositories.balance.getUserLastBalance(insertedUser.id);
    const resultBilling: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    /** - Test - */
    expect(resultBalance.currentBalanceCents).toBe(insertedBalance.currentBalanceCents + toAdd);
    expect(resultBilling.accountFundsCents).toBe(insertedBilling.accountFundsCents + toAdd);
  });

  test('Adding credits from non existing user', async () => {
    /** - Setup - */
    const id: string = TestUtil.generateId();
    const toAdd: number = 20_000;

    /** - Run - */
    const resulting: Promise<BalanceDto> = setup.useCase.addUserCredits(toAdd, id).unsafeRun();

    /** - Test - */
    await expect(resulting).rejects.toThrow(NoCreditsAddedDomainError);
  });

  test('Adding credits for paid payment owner', async () => {
    /** - Test - */
    const initialBalance: number = 300_000;
    const toAdd: number = 20_000;

    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount({ billing: { accountFundsCents: initialBalance } });
    await setup.repositories.balance.insert({
      currentBalanceCents: initialBalance,
      lastBalanceCents: initialBalance,
      userId: insertedUser.id,
    });

    const insertedPayment: PaymentDto = await setup.repositories.payment.insert({
      billingId: insertedBilling.id,
      realPriceInCents: toAdd,
      totalPriceWithDiscountInCents: 0,
      status: PaymentStatus.PAID,
    });

    /** - Run - */
    const resultBalance: BalanceDto = await setup.useCase.addUserCreditsFromPayment(insertedPayment.id).unsafeRun();
    const resultBilling: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    /** - Test - */
    expect(resultBalance.currentBalanceCents).toBe(initialBalance + toAdd);
    expect(resultBilling.accountFundsCents).toBe(initialBalance + toAdd);
  });

  test('Adding credits for pending payment owner', async () => {
    /** - Test - */
    const initialBalance: number = 300_000;
    const toAdd: number = 20_000;

    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount({ billing: { accountFundsCents: initialBalance } });
    await setup.repositories.balance.insert({
      currentBalanceCents: initialBalance,
      lastBalanceCents: initialBalance,
      userId: insertedUser.id,
    });

    const insertedPayment: PaymentDto = await setup.repositories.payment.insert({
      billingId: insertedBilling.id,
      realPriceInCents: toAdd,
      totalPriceWithDiscountInCents: 0,
      status: PaymentStatus.PENDING,
    });

    /** - Run - */
    const resultingBalance: Promise<BalanceDto> = setup.useCase
      .addUserCreditsFromPayment(insertedPayment.id)
      .unsafeRun();

    /** - Test - */
    await expect(resultingBalance).rejects.toThrow(InvalidPaymentStateForOperationDomainError);
  });

  test('Adding credits for paid payment without owner', async () => {
    /** - Test - */
    const toAdd: number = 20_000;

    const insertedPayment: PaymentDto = await setup.repositories.payment.insert({
      billingId: TestUtil.generateId(),
      realPriceInCents: toAdd,
      totalPriceWithDiscountInCents: 0,
      status: PaymentStatus.PAID,
    });

    /** - Run - */
    const resultingBalance: Promise<BalanceDto> = setup.useCase
      .addUserCreditsFromPayment(insertedPayment.id)
      .unsafeRun();

    /** - Test - */
    await expect(resultingBalance).rejects.toThrow(NoUserFoundDomainError);
  });

  test('Adding duplicate credits for payment paid', async () => {
    /** - Test - */
    const initialBalance: number = 300_000;
    const toAdd: number = 20_000;

    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount({ billing: { accountFundsCents: initialBalance } });
    await setup.repositories.balance.insert({
      currentBalanceCents: initialBalance,
      lastBalanceCents: initialBalance,
      userId: insertedUser.id,
    });

    const insertedPayment: PaymentDto = await setup.repositories.payment.insert({
      billingId: insertedBilling.id,
      realPriceInCents: toAdd,
      totalPriceWithDiscountInCents: 0,
      status: PaymentStatus.PAID,
    });

    /** - Run - */
    const step1Balance: BalanceDto = await setup.useCase.addUserCreditsFromPayment(insertedPayment.id).unsafeRun();
    const step1Billing: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);
    const step2Balance: Promise<BalanceDto> = setup.useCase.addUserCreditsFromPayment(insertedPayment.id).unsafeRun();
    const step2Billing: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    /** - Test - */
    expect(step1Balance.currentBalanceCents).toBe(initialBalance + toAdd);
    expect(step1Billing.accountFundsCents).toBe(initialBalance + toAdd);
    await expect(step2Balance).rejects.toThrow(CreditsAlreadyAddedDomainError);
    expect(step2Billing.accountFundsCents).toBe(step1Billing.accountFundsCents);
  });
});
