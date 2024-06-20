import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { GetUserDomain } from '../../../../domain/core/user/get-user.domain';

// custom tests
describe(GetUserDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<GetUserDomain> = TestSetup.run(GetUserDomain);

  test('Trying to get a user that does exist', async () => {
    /** - Setup - */
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();

    /** - Run - */
    const user: UserDto = await setup.useCase.getUser(insertedUser.id).unsafeRun();

    // tests
    expect(user).toStrictEqual(insertedUser);
  });

  test("Trying to get a user with a id that doesn't exist", async () => {
    /** - Setup - */
    const id: string = TestUtil.generateId();

    /** - Run - */
    const queryingUser: Promise<UserDto> = setup.useCase.getUser(id).unsafeRun();

    // tests
    await expect(queryingUser).rejects.toThrow();
  });
});
