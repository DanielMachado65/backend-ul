import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { PasswordRecoveryDomain } from 'src/domain/support/auth/password-recovery.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(PasswordRecoveryDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<PasswordRecoveryDomain> = TestSetup.run(PasswordRecoveryDomain);

  test('recover password from existing user should success', async () => {
    /** - Run - */
    const { cpf, email }: UserDto = await setup.factory.createUserWithOnlyRequirements();

    /** - Run - */
    const passwordRecoveryIO: Promise<null> = setup.useCase.recoverPassword(email, cpf).unsafeRun();

    /** - Test - */
    await expect(passwordRecoveryIO).resolves.toBeNull();
  });

  test('recover password from non existing user should success', async () => {
    /** - Run - */
    const passwordRecoveryIO: Promise<null> = setup.useCase
      .recoverPassword('teste@email.com', '00011122233')
      .unsafeRun();

    /** - Test - */
    await expect(passwordRecoveryIO).resolves.toBeNull();
  });
});
