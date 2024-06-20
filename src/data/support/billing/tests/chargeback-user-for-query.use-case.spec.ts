// todo

import { BalanceDto } from 'src/domain/_layer/data/dto/balance.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { NoBalanceFoundDomainError } from 'src/domain/_entity/result.error';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { ChargebackUserDomain } from 'src/domain/support/billing/chargeback-user.domain';

describe(ChargebackUserDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<ChargebackUserDomain> = TestSetup.run(ChargebackUserDomain);

  test('Chargeback a user for query', async () => {
    /** - Setup - */
    const balanceBeforeChargeback: number = 100_000;
    const chargeBackAmount: number = 10_000;

    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: {
        accountFundsCents: balanceBeforeChargeback,
        activeAccount: true,
      },
    });
    const insertedBalance: BalanceDto = await setup.repositories.balance.insert({
      currentBalanceCents: balanceBeforeChargeback,
      lastBalanceCents: balanceBeforeChargeback + chargeBackAmount,
      userId: insertedUser.id,
    });

    /** - Run - */
    const resultBilling: BillingDto = await setup.useCase.chargebackUser(insertedBalance.id).unsafeRun();
    const resultBalance: BalanceDto = await setup.repositories.balance.getUserLastBalance(insertedUser.id);

    /** - Test - */
    expect(resultBilling.accountFundsCents).toBe(balanceBeforeChargeback + chargeBackAmount);
    expect(resultBalance).toBeNull(); // could it create another balance instead of deleting old?
  });

  test('Chargeback a non existing user for query', async () => {
    /** - Setup - */
    const id: string = TestUtil.generateId();

    /** - Run - */
    const resultingBilling: Promise<BillingDto> = setup.useCase.chargebackUser(id).unsafeRun();

    /** - Test - */
    await expect(resultingBilling).rejects.toThrow(NoBalanceFoundDomainError);
  });
});
