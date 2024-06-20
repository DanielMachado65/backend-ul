import { DeductUserCreditsDomain } from 'src/domain/support/billing/deduct-user-credits.domain';
import { NoUserFoundDomainError } from 'src/domain/_entity/result.error';
import { BalanceDto } from 'src/domain/_layer/data/dto/balance.dto';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(DeductUserCreditsDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<DeductUserCreditsDomain> = TestSetup.run(DeductUserCreditsDomain);

  test('Deducting credits from user', async () => {
    /** - Setup - */
    const initialBalance: number = 300_000;
    const toRemove: number = 20_000;

    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount({ billing: { accountFundsCents: initialBalance } });
    await setup.repositories.balance.insert({
      currentBalanceCents: initialBalance,
      lastBalanceCents: initialBalance,
      userId: insertedUser.id,
    });

    /** - Run - */
    const resultBalance: BalanceDto = await setup.useCase.deductUserCredits(toRemove, insertedUser.id).unsafeRun();

    const resultBilling: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    /** - Test - */
    expect(resultBalance.currentBalanceCents).toBe(initialBalance - toRemove);
    expect(resultBilling.accountFundsCents).toBe(initialBalance - toRemove);
  });

  test('Deducting credits from user with invalid values', async () => {
    /** - Setup - */
    const initialBalance: number = 300_000;

    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount({ billing: { accountFundsCents: initialBalance } });
    const insertedBalance: BalanceDto = await setup.repositories.balance.insert({
      currentBalanceCents: initialBalance,
      lastBalanceCents: initialBalance,
      userId: insertedUser.id,
    });

    const cases: readonly number[] = [-10_000, NaN, 'error' as unknown as number];
    let sumOfAllCases: number = 0;
    for (const caseTest of cases) {
      await setup.useCase.deductUserCredits(caseTest, insertedUser.id).unsafeRun();

      // rule of deduction
      if (isNaN(caseTest)) sumOfAllCases += 0;
      else if (typeof caseTest === 'string') sumOfAllCases += 0;
      else sumOfAllCases += caseTest;
    }

    /** - Run - */
    const resultBalance: BalanceDto = await setup.repositories.balance.getUserLastBalance(insertedUser.id);
    const resultBilling: BillingDto = await setup.repositories.billing.getById(insertedBilling.id);

    /** - Test - */
    expect(resultBalance.currentBalanceCents).toBe(insertedBalance.currentBalanceCents - sumOfAllCases);
    expect(resultBilling.accountFundsCents).toBe(insertedBilling.accountFundsCents - sumOfAllCases);
  });

  test('Deducting credits from non existing user', async () => {
    /** - Setup - */
    const id: string = TestUtil.generateId();
    const toRemove: number = 20_000;

    /** - Run - */
    const resulting: Promise<BalanceDto> = setup.useCase.deductUserCredits(toRemove, id).unsafeRun();

    /** - Test - */
    await expect(resulting).rejects.toThrow(NoUserFoundDomainError);
  });
});
