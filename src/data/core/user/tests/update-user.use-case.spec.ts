import { UnauthorizedExceptionDomainError } from 'src/domain/_entity/result.error';
import { UserAddress } from 'src/domain/_entity/user.entity';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UpdateUserProfileDomain, UpdateUserProfileParams } from 'src/domain/core/user/update-user.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(UpdateUserProfileDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<UpdateUserProfileDomain> = TestSetup.run(UpdateUserProfileDomain);

  test('Request update user with no changes', async () => {
    /** - Setup - */
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements({ name: 'Primeiro Segundo' });

    /** - Run - */
    const user: UserDto = await setup.useCase
      .updateUser(insertedUser.id, { email: insertedUser.email, name: insertedUser.name })
      .unsafeRun();

    // tests
    expect(user).toStrictEqual(insertedUser);
  });

  test('Update user trivial data', async () => {
    /** - Setup - */
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements({
      name: 'Primeiro Segundo',
    });
    const params: UpdateUserProfileParams = {
      email: 'new@email.com',
      name: 'New Name',
      // phoneNumber: '',
    };

    /** - Run - */
    const user: UserDto = await setup.useCase.updateUser(insertedUser.id, params).unsafeRun();

    // tests
    expect(user).toStrictEqual({ ...insertedUser, ...params });
  });

  test('Update user address info', async () => {
    /** - Setup - */
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements({ name: 'Primeiro Segundo' });
    const newAddress1: UserAddress = {
      zipCode: '12345678',
      city: 'Cidade das ...',
      state: 'MG',
      neighborhood: 'Bairro',
      street: 'Rua das',
      complement: null, // <- removes complement
      number: '1A',
    };
    const newAddress2: UserAddress = {
      zipCode: '12345678',
      city: 'Cidade das ...',
      state: 'MG',
      neighborhood: 'Bairro',
      street: 'Rua das',
      complement: undefined, // <- keeps old
      number: '1A',
    };

    /** - Run - */
    const user1: UserDto = await setup.useCase
      .updateUser(insertedUser.id, {
        email: insertedUser.email,
        name: insertedUser.name,
        address: newAddress1,
      })
      .unsafeRun();
    const user2: UserDto = await setup.useCase
      .updateUser(insertedUser.id, {
        email: insertedUser.email,
        name: insertedUser.name,
        address: newAddress2,
      })
      .unsafeRun();

    // tests
    expect(user1).toStrictEqual({ ...user1, address: { ...newAddress1 } });
    expect(user2).toStrictEqual({
      ...user2,
      address: { ...newAddress2, complement: insertedUser.address.complement },
    });
  });

  // /** CPF doesn't update */
  test('Update user CPF', async () => {
    /** - Setup - */
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements({
      name: 'Primeiro Segundo',
      cpf: '::OLD::',
    });
    const params: UpdateUserProfileParams = {
      email: insertedUser.email,
      name: insertedUser.name,
      cpf: '::NEW::',
    } as unknown as UpdateUserProfileParams;

    /** - Run - */
    const user: UserDto = await setup.useCase.updateUser(insertedUser.id, params).unsafeRun();

    // tests
    expect(user).toStrictEqual(insertedUser);
  });

  test('Update password', async () => {
    /** - Setup - */
    const currentPassword: string = 'old';
    const newPassword: string = 'Password123@';
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements({
      name: 'Primeiro Segundo',
      password: setup.utils.encryption.encrypt(currentPassword),
    });

    /** - Run - */
    const user: UserDto = await setup.useCase
      .updateUser(insertedUser.id, {
        email: insertedUser.email,
        name: insertedUser.name,
        newPassword,
        currentPassword,
      })
      .unsafeRun();

    const updateUserWithPass: UserDto = await setup.repositories.user.getByIdWithPassword(insertedUser.id);

    // tests
    const newPasswordEncrypted: string = setup.utils.encryption.encrypt(newPassword);
    expect(user).toStrictEqual(insertedUser);
    expect(newPasswordEncrypted).toStrictEqual(updateUserWithPass.password);
  });

  test('Update password with wrong current password', async () => {
    /** - Setup - */
    const currentPassword: string = 'old';
    const newPassword: string = 'Password123@';

    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements({
      name: 'Primeiro Segundo',
      password: setup.utils.encryption.encrypt(currentPassword),
    });

    /** - Run - */
    const updatingUser: Promise<UserDto> = setup.useCase
      .updateUser(insertedUser.id, {
        email: insertedUser.email,
        name: insertedUser.name,
        newPassword,
        currentPassword: 'wrong',
      })
      .unsafeRun();

    // tests
    await expect(updatingUser).rejects.toThrow(UnauthorizedExceptionDomainError);
  });

  test('Update password with missing current password and password confirmation', async () => {
    /** - Setup - */
    const currentPassword: string = 'old';
    const newPassword: string = 'Password123@';

    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements({
      name: 'Primeiro Segundo',
      password: setup.utils.encryption.encrypt(currentPassword),
    });

    /** - Run - */
    const user: UserDto = await setup.useCase
      .updateUser(insertedUser.id, {
        email: insertedUser.email,
        name: insertedUser.name,
        newPassword,
      })
      .unsafeRun();

    const updateUserWithPass: UserDto = await setup.repositories.user.getByIdWithPassword(insertedUser.id);

    // tests
    const currentPasswordEncrypted: string = setup.utils.encryption.encrypt(currentPassword);
    expect(user).toStrictEqual(insertedUser);
    expect(currentPasswordEncrypted).toStrictEqual(updateUserWithPass.password);
  });
});
