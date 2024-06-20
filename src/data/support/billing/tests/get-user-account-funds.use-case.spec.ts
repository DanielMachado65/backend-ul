import { GetUserAccountFundsDomain } from 'src/domain/support/billing/get-user-account-funds.domain';
import { NoUserFoundDomainError } from 'src/domain/_entity/result.error';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(GetUserAccountFundsDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<GetUserAccountFundsDomain> = TestSetup.run(GetUserAccountFundsDomain);

  it('Should return account funds from user', async () => {
    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount();

    const accountFunds: number = await setup.useCase.getUserAccountFunds(insertedUser.id).unsafeRun();

    expect(accountFunds).toBe(insertedBilling.accountFundsCents);
  });

  it("Should give error because user doesn't exist", async () => {
    const id: string = TestUtil.generateId();
    const accountingFunds: Promise<number> = setup.useCase.getUserAccountFunds(id).unsafeRun();

    await expect(accountingFunds).rejects.toThrow(NoUserFoundDomainError);
  });

  it("Should give error because user billing doesn't exist for some reason", async () => {
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();

    const accountingFunds: Promise<number> = setup.useCase.getUserAccountFunds(insertedUser.id).unsafeRun();

    await expect(accountingFunds).rejects.toThrow(NoUserFoundDomainError); // should be like UnknownDomainError
  });

  /**
   * --- Meta testing ---
   *
   * The database should cleanup between tests
   */

  let betweenUserId: string;

  it('Should return account funds from user - p1', async () => {
    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount();
    betweenUserId = insertedUser.id;

    const accountFunds: number = await setup.useCase.getUserAccountFunds(betweenUserId).unsafeRun();

    expect(accountFunds).toBe(insertedBilling.accountFundsCents);
  });

  it('Should return account funds from user - p2', async () => {
    /** - Run - */
    const accountingFunds: Promise<number> = setup.useCase.getUserAccountFunds(betweenUserId).unsafeRun();

    /** - Test - */
    await expect(accountingFunds).rejects.toThrow(NoUserFoundDomainError);
  });
});
