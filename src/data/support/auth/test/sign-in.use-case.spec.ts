import { InvalidCredentialsDomainError, UserDisabledDomainError } from 'src/domain/_entity/result.error';
import { TokenEntity } from 'src/domain/_entity/token.entity';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { SignInDomain } from 'src/domain/support/auth/sign-in.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { DeviceKind } from '../../../../domain/_layer/infrastructure/middleware/device-info.middleware';

describe(SignInDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<SignInDomain> = TestSetup.run(SignInDomain);
  const reqParentId: string = 'reqParentId';
  const nowDate: Date = new Date(2020, 0, 0);

  /** - Setup - */
  beforeAll(() => {
    jest.useFakeTimers({
      now: nowDate,
      doNotFake: ['nextTick'],
    }); // modern freezes tests
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('sign in with a existing user', async () => {
    /** - Setup - */
    const password: string = '123456';
    const hashedPassword: string = setup.utils.encryption.encrypt(password);
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements({
      status: true,
      password: hashedPassword,
    });

    /** - Run - */
    const token: TokenEntity = await setup.useCase
      .signIn(insertedUser.email, password, DeviceKind.UNKNOWN, reqParentId)
      .unsafeRun();
    const updatedUser: UserDto = await setup.repositories.user.getById(insertedUser.id);

    /** - Test - */
    expect(token).toBeDefined();
    expect(updatedUser.lastLogin).toBe(nowDate.toISOString());
  });

  test('sign in with a existing user with wrong password', async () => {
    /** - Setup - */
    const password: string = '123456';
    const hashedPassword: string = setup.utils.encryption.encrypt(password);
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements({
      status: true,
      password: hashedPassword,
    });

    /** - Run - */
    const gettingToken: Promise<TokenEntity> = setup.useCase
      .signIn(insertedUser.email, '', DeviceKind.UNKNOWN, reqParentId)
      .unsafeRun();

    /** - Test - */
    await expect(gettingToken).rejects.toThrow(InvalidCredentialsDomainError);
  });

  test('sign in with a non existing user', async () => {
    /** - Run - */
    const gettingToken: Promise<TokenEntity> = setup.useCase
      .signIn('null', 'null', DeviceKind.UNKNOWN, reqParentId)
      .unsafeRun();

    /** - Test - */
    await expect(gettingToken).rejects.toThrow(InvalidCredentialsDomainError);
  });

  test('sign in with disabled user', async () => {
    const password: string = '123456';
    const hashedPassword: string = setup.utils.encryption.encrypt(password);
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements({
      status: false,
      password: hashedPassword,
    });

    /** - Run - */
    const gettingToken: Promise<TokenEntity> = setup.useCase
      .signIn(insertedUser.email, password, DeviceKind.UNKNOWN, reqParentId)
      .unsafeRun();

    /** - Test - */
    await expect(gettingToken).rejects.toThrow(UserDisabledDomainError);
  });
});
