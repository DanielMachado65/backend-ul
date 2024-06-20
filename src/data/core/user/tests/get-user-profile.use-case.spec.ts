import { GetUserProfileDomain, UserProfile } from 'src/domain/core/user/get-user-profile.domain';
import { NoUserFoundDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(GetUserProfileDomain.name, () => {
  const setup: TestSetup<GetUserProfileDomain> = TestSetup.run(GetUserProfileDomain);

  test('Trying to get a user profile that does exist', async () => {
    /** - Setup - */
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();

    const expected: Record<string, unknown> = {
      id: insertedUser.id,
      email: insertedUser.email,
      cpf: insertedUser.cpf,
      name: insertedUser.name,
      phoneNumber: insertedUser.phoneNumber,
      type: insertedUser.type,
      lastLogin: insertedUser.lastLogin,
      createdAt: insertedUser.createdAt,
      status: insertedUser.status,
      creationOrigin: insertedUser.creationOrigin,
      address: insertedUser.address,
      billingId: insertedUser.billingId,
      needsPasswordUpdate: insertedUser.needsPasswordUpdate,
    };

    /** - Run - */
    const user: UserProfile = await setup.useCase.getUserProfile(insertedUser.id).unsafeRun();

    /** - Test - */
    expect(user).toStrictEqual(expected);
  });

  test("Trying to get a user profile with a id that doesn't exist", async () => {
    /** - Setup - */
    const id: string = TestUtil.generateId();

    /** - Run - */
    const queryingUser: Promise<UserProfile> = setup.useCase.getUserProfile(id).unsafeRun();

    /** - Test - */
    await expect(queryingUser).rejects.toThrow(NoUserFoundDomainError);
  });
});
