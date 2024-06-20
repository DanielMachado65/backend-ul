import { UserDto } from '../../../../domain/_layer/data/dto/user.dto';
import { PaymentDto } from '../../../../domain/_layer/data/dto/payment.dto';
import { BillingDto } from '../../../../domain/_layer/data/dto/billing.dto';
import { NfeDto } from '../../../../domain/_layer/data/dto/nfe.dto';
import {
  InvalidPaymentStateForOperationDomainError,
  NfeAlreadyCreatedDomainError,
  NoPaymentFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../../domain/_entity/result.error';
import { PaymentStatus } from '../../../../domain/_entity/payment.entity';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { CreateNfeDomain } from 'src/domain/support/payment/create-nfe.domain';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { EitherIO } from '@alissonfpmorais/minimal_fp';

describe(CreateNfeDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<CreateNfeDomain> = TestSetup.run(CreateNfeDomain);

  test('Create a successful NFe', async () => {
    /** - Setup - */
    const totalPaidInCents: number = 1234;

    // user & billing
    const [user, billing]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();

    // payment
    const payment: PaymentDto = await setup.repositories.payment.insert({
      billingId: billing.id,
      totalPaidInCents,
      status: PaymentStatus.PAID,
    });

    jest.spyOn(setup.servicesMocks.nfeService, 'generateNfe').mockImplementation(() =>
      EitherIO.of(UnknownDomainError.toFn(), {
        externalId: payment.id,
        number: 'nm',
        confirmationNumber: 'conf_nm',
      }),
    );

    /** - Run - */
    const nfeDto: NfeDto = await setup.useCase.createNfe(payment.id).unsafeRun();
    const nextPayment: PaymentDto = await setup.repositories.payment.getById(payment.id);
    const nextNfe: NfeDto = await setup.repositories.nfe.getById(nfeDto.id);

    /** - Test - */
    expect({
      ...nfeDto,
      description: 'CONSULTA VEICULAR - OLHO NO CARRO',
      valueInCents: totalPaidInCents,
      userId: user.id,
      paymentId: payment.id,
    }).toStrictEqual(nfeDto);

    expect({ ...nextPayment, nfeId: nextNfe.id }).toStrictEqual(nextPayment);
  });

  test('Create NFe from non existing payment', async () => {
    /** - Setup - */
    const invalidPaymentId: string = TestUtil.generateId();

    /** - Run - */
    const promise: Promise<NfeDto> = setup.useCase.createNfe(invalidPaymentId).unsafeRun();

    /** - Test - */
    await expect(promise).rejects.toThrow(NoPaymentFoundDomainError);
  });

  test('Create a NFe with payment not yet paid', async () => {
    /** - Setup - */
    const billing: BillingDto = await setup.factory.createDissociatedEmptyBilling();

    const payment: PaymentDto = await setup.repositories.payment.insert({
      billingId: billing.id,
      status: PaymentStatus.PENDING,
    });

    /** - Run - */
    const promise: Promise<NfeDto> = setup.useCase.createNfe(payment.id).unsafeRun();

    /** - Test - */
    await expect(promise).rejects.toThrow(InvalidPaymentStateForOperationDomainError);
  });

  test('Create a NFe without user', async () => {
    /** - Setup - */
    const billing: BillingDto = await setup.factory.createDissociatedEmptyBilling();

    const payment: PaymentDto = await setup.repositories.payment.insert({
      billingId: billing.id,
      status: PaymentStatus.PAID,
    });

    /** - Run - */
    const promise: Promise<NfeDto> = setup.useCase.createNfe(payment.id).unsafeRun();

    /** - Test - */
    await expect(promise).rejects.toThrow(NoUserFoundDomainError);
  });

  test('Create a NFe for a payment that already has a NFe', async () => {
    /** - Setup - */
    const totalPaidInCents: number = 1234;

    // user & billing
    const [user, billing]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount();

    // payment
    const payment: PaymentDto = await setup.repositories.payment.insert({
      billingId: billing.id,
      totalPaidInCents,
      status: PaymentStatus.PAID,
    });

    // nfe
    const nfe: NfeDto = await setup.repositories.nfe.insert({
      userId: user.id,
      paymentId: payment.id,
    });

    await setup.repositories.payment.updateById(payment.id, { nfeId: nfe.id });

    /** - Run - */
    const promise: Promise<NfeDto> = setup.useCase.createNfe(payment.id).unsafeRun();

    /** - Test - */
    await expect(promise).rejects.toThrow(NfeAlreadyCreatedDomainError);
  });
});
