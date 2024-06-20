import { PaymentFillingOrder, PaymentSplittingType } from 'src/domain/_entity/payment-management.entity';
import { NoUserFoundDomainError, ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { AddUserAtPaymentGatewayDomain } from 'src/domain/core/user/add-user-at-payment-gateway.domain';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(AddUserAtPaymentGatewayDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<AddUserAtPaymentGatewayDomain> = TestSetup.run(AddUserAtPaymentGatewayDomain);
  const reqParentId: string = 'reqParentId';

  test('Creating customer at gateway for user', async () => {
    /** - Setup - */
    const externalId: string = '::ID::';
    const cnpj: string = '11222333444455';
    const user: UserDto = await setup.factory.createUserWithOnlyRequirements({ name: 'Luan jesn 2  ' });
    await setup.repositories.paymentManagement.insert({
      id: TestUtil.generateId(),
      splittingType: PaymentSplittingType.ABSOLUTE,
      fillingOrder: PaymentFillingOrder.RANDOM,
      rules: [
        {
          cnpj: cnpj,
          fillOrder: 1,
          maxValueCents: 10000,
        },
      ],
    });

    jest
      .spyOn(setup.servicesMocks.paymentGatewayService, 'createCustomerIfNotExists')
      .mockImplementation(async () => externalId);

    /** - Run - */
    const updatedUser: UserDto = await setup.useCase.addUserAtGateway(user.id, reqParentId).unsafeRun();

    /** - Test - */
    const expectedUser: UserDto = {
      ...user,
      name: 'Luan Jesn',
      externalControls: {
        ...user.externalControls,
        arc: { ...user.externalControls?.arc, tenants: [{ id: externalId, cnpj: cnpj }] },
      },
    };
    expect(updatedUser).toStrictEqual(expectedUser);
  });

  test('Failing at creating customer at gateway for user', async () => {
    /** - Setup - */
    await setup.repositories.paymentManagement.insert({
      splittingType: PaymentSplittingType.ABSOLUTE,
      fillingOrder: PaymentFillingOrder.SEQUENTIAL,
      rules: [
        { cnpj: '11222333444455', fillOrder: 1, maxValueCents: 1000 },
        { cnpj: '22333444555566', fillOrder: 2, maxValueCents: 1000 },
      ],
    });

    const user: UserDto = await setup.factory.createUserWithOnlyRequirements({ name: 'Luan Jesn' });

    jest.spyOn(setup.servicesMocks.paymentGatewayService, 'createCustomerIfNotExists').mockImplementation(async () => {
      throw null;
    });

    /** - Run - */
    const updatingUser: Promise<UserDto> = setup.useCase.addUserAtGateway(user.id, reqParentId).unsafeRun();

    /** - Test - */
    await expect(updatingUser).rejects.toThrow(ProviderUnavailableDomainError);
  });

  test('Creating customer at gateway for non existing user', async () => {
    /** - Setup - */

    /** - Run - */
    const updatingUser: Promise<UserDto> = setup.useCase
      .addUserAtGateway(TestUtil.generateId(), reqParentId)
      .unsafeRun();

    /** - Test - */
    await expect(updatingUser).rejects.toThrow(NoUserFoundDomainError);
  });
});
