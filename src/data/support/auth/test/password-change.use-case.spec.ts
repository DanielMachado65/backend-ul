import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { AuthHelper } from '../auth.helper';
import {
  InvalidCredentialsDomainError,
  NoUserFoundDomainError,
  UserHasWeakPasswordDomainError,
} from '../../../../domain/_entity/result.error';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { PasswordChangeDomain } from 'src/domain/support/auth/password-change.domain';

describe(PasswordChangeDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<PasswordChangeDomain> = TestSetup.run(PasswordChangeDomain);
  let authHelper: AuthHelper;

  beforeEach(async () => {
    authHelper = setup.module.get(AuthHelper);
  });

  test('change password with right token from existing user should success', async () => {
    /** - Setup - */
    const firstPassword: string = 'firstPassword';
    const firstPasswordHash: string = await setup.utils.encryption.encrypt(firstPassword);
    const nextPassword: string = 'nextPassword123#';
    const user: UserDto = await setup.factory.createUserWithOnlyRequirements({ password: firstPasswordHash });
    const { id, createdAt }: UserDto = user;

    /** - Run - */
    const token: string = authHelper.generateResetToken(id, firstPasswordHash, createdAt, false);
    const nextUserDto: UserDto = await setup.useCase.changePassword(token, nextPassword).unsafeRun();

    /** - Test - */
    await expect(nextUserDto).toStrictEqual(user);
  });

  test('change password with right token but weak password from existing user should fail', async () => {
    /** - Setup - */
    const firstPassword: string = 'firstPassword';
    const firstPasswordHash: string = await setup.utils.encryption.encrypt(firstPassword);
    const nextPassword: string = '123123';
    const user: UserDto = await setup.factory.createUserWithOnlyRequirements({ password: firstPasswordHash });
    const { id, createdAt }: UserDto = user;

    /** - Run - */
    const token: string = authHelper.generateResetToken(id, firstPasswordHash, createdAt, false);
    const nextUserDto: Promise<UserDto> = setup.useCase.changePassword(token, nextPassword).unsafeRun();

    /** - Test - */
    await expect(nextUserDto).rejects.toThrow(UserHasWeakPasswordDomainError);
  });

  test('change password with right token from non existing user should fail', async () => {
    /** - Setup - */
    const id: string = TestUtil.generateId();
    const nextPassword: string = 'nextPassword123#';

    /** - Run - */
    const token: string = authHelper.generateResetToken(id, 'password', new Date().toISOString(), false);
    const nextUserDto: Promise<UserDto> = setup.useCase.changePassword(token, nextPassword).unsafeRun();

    /** - Test - */
    await expect(nextUserDto).rejects.toThrow(NoUserFoundDomainError);
  });

  test('change password with right token from existing user should fail', async () => {
    /** - Setup - */
    const token: string = 'token';

    /** - Run - */
    const nextUserDto: Promise<UserDto> = setup.useCase.changePassword(token, '').unsafeRun();

    /** - Test - */
    await expect(nextUserDto).rejects.toThrow(InvalidCredentialsDomainError);
  });
});
