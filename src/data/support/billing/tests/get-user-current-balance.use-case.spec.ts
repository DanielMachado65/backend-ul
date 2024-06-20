import { GetUserCurrentBalanceDomain } from 'src/domain/support/billing/get-user-current-balance.domain';
import { BalanceDto } from 'src/domain/_layer/data/dto/balance.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(GetUserCurrentBalanceDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<GetUserCurrentBalanceDomain> = TestSetup.run(GetUserCurrentBalanceDomain);

  it('Get balance', async () => {
    /** - Run - */
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();
    const insertedBalance: BalanceDto = await setup.repositories.balance.insert({ userId: insertedUser.id });
    const balance: BalanceDto = await setup.useCase.getUserCurrentBalance(insertedUser.id).unsafeRun();

    /** - Test - */
    expect(balance).toMatchObject(insertedBalance);
  });

  // Usecase automatically inserts a balance if there none
  // Could this mean that someone flood the system with hundreds of balance without a valid user?
  it("Get balance from user that doesn't exist", async () => {
    /** - Run - */
    const id: string = TestUtil.generateId();
    const gotBalance: BalanceDto = await setup.useCase.getUserCurrentBalance(id).unsafeRun();

    /** - Test - */
    expect(gotBalance).toBeDefined();
  });
});
