import { SyncWithExternalSubscriptionHelper } from 'src/data/shared/sync-with-external-subscription.helper';
import { MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { PlanPayableWith, PlanTag } from 'src/domain/_entity/plan.entity';
import { NoSubscriptionFoundDomainError } from 'src/domain/_entity/result.error';
import { SubscriptionGateway, SubscriptionStatus } from 'src/domain/_entity/subscription.entity';
import {
  ExternalSubscriptionDto,
  ExternalSubscriptionRecurringCycle,
  ExternalSubscriptionStatus,
} from 'src/domain/_layer/data/dto/external-subscription.dto';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { SyncWithExternalSubscriptionUseCase } from '../sync-with-external-subscription.use-case';

describe('SyncWithExternalSubscriptionUseCase', () => {
  /**
   * !! Dict !!
   * MC = My Cars
   */

  const emptySubscription: SubscriptionDto = {
    id: 'sub-id',
    userId: '',
    planId: '',
    billingId: '',
    paymentIds: [],
    gateway: SubscriptionGateway.ARC,
    gatewayRef: '',
    paymentMethod: PlanPayableWith.CREDIT_CARD,
    ignoreBillingNotification: false,
    status: SubscriptionStatus.ACTIVE,
    planTag: PlanTag.MY_CARS,
    deactivatedAt: null,
    nextChargeAt: new Date(11000).toISOString(),
    expiresAt: new Date(12000).toISOString(),
    createdAt: '',
    updatedAt: '',
  };
  const emptyExternalSubscription: ExternalSubscriptionDto = {
    ref: 'ext-sub',
    idempotence: emptySubscription.id,
    status: ExternalSubscriptionStatus.ACTIVE,
    recurringCycle: ExternalSubscriptionRecurringCycle.MONTHLY,
    recurringValueInCents: 0,
    daysBeforeExpire: 0,
    chargeAt: new Date(20000).toISOString(),
    dueAt: new Date(21000).toISOString(),
    expiresAt: new Date(22000).toISOString(),
    creditCardRef: '',
    customerRef: '',
    strategyRef: '',
    createdAt: '',
    gateway: SubscriptionGateway.ARC,
    creditCard: {
      id: '',
      lastFourDigits: '',
      brandCard: '',
      brandCardImg: '',
      expirationDate: '',
    },
  };
  const emptyMyCar: MyCarProductDto = {
    id: 'car-id',
    billingId: '',
    subscriptionId: '',
    type: MyCarProductTypeEnum.PREMIUM,
    status: MyCarProductStatusEnum.ACTIVE,
    expiresAt: new Date(12000).toISOString(),
    deactivatedAt: null,
    deletedAt: '',
    revisionConfig: null,
    onQueryConfig: null,
    priceFIPEConfig: null,
    fineConfig: null,
    keys: null,
    createdAt: '',
    updatedAt: '',
  };
  const cnpj: string = 'cnpj';

  let mockPaymentGatewayService: jest.Mocked<PaymentGatewayService>;
  let mockMyCarProductRepository: jest.Mocked<MyCarProductRepository>;
  let mockSubscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let usecase: SyncWithExternalSubscriptionUseCase;
  let envService: jest.Mocked<EnvService>;

  beforeEach(() => {
    mockPaymentGatewayService = {
      fetchSubscription: jest.fn(),
    } as unknown as jest.Mocked<PaymentGatewayService>;
    mockMyCarProductRepository = {
      getBySubscriptionId: jest.fn(),
      updateById: jest.fn(),
    } as unknown as jest.Mocked<MyCarProductRepository>;
    mockSubscriptionRepository = {
      getById: jest.fn(),
      updateById: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;
    envService = {
      get: jest.fn(() => cnpj),
    } as unknown as jest.Mocked<EnvService>;

    const syncWithExternalSubscriptionHelper: SyncWithExternalSubscriptionHelper =
      new SyncWithExternalSubscriptionHelper(mockSubscriptionRepository, mockMyCarProductRepository);

    usecase = new SyncWithExternalSubscriptionUseCase(
      mockPaymentGatewayService,
      mockSubscriptionRepository,
      mockMyCarProductRepository,
      syncWithExternalSubscriptionHelper,
      envService,
    );
  });

  it('Subscription paid in time, all good', async () => {
    mockPaymentGatewayService.fetchSubscription.mockImplementation(async () => emptyExternalSubscription);
    mockMyCarProductRepository.getBySubscriptionId.mockImplementation(async () => emptyMyCar);
    mockMyCarProductRepository.updateById.mockImplementation(async (_id: string, mc: MyCarProductDto) => ({
      ...emptyMyCar,
      ...mc,
    }));
    mockSubscriptionRepository.getById.mockImplementation(async () => emptySubscription);
    mockSubscriptionRepository.updateById.mockImplementation(async (_id: string, sub: SubscriptionDto) => ({
      ...emptySubscription,
      ...sub,
    }));

    const subscription: SubscriptionDto = await usecase
      .syncWithExternalReference(emptyExternalSubscription.ref, emptyExternalSubscription.idempotence)
      .unsafeRun();

    expect(mockPaymentGatewayService.fetchSubscription).toBeCalledWith(emptyExternalSubscription.ref, cnpj);
    expect(mockMyCarProductRepository.getBySubscriptionId).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockMyCarProductRepository.updateById).toBeCalledWith(emptyMyCar.id, {
      expiresAt: emptyExternalSubscription.expiresAt,
      status: MyCarProductStatusEnum.ACTIVE,
      deactivatedAt: null,
    });
    expect(mockSubscriptionRepository.getById).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockSubscriptionRepository.updateById).toBeCalledWith(emptySubscription.id, {
      expiresAt: emptyExternalSubscription.expiresAt,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      status: SubscriptionStatus.ACTIVE,
      deactivatedAt: null,
    });

    expect(subscription).toEqual({
      ...emptySubscription,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      expiresAt: emptyExternalSubscription.expiresAt,
      deactivatedAt: null,
    });
  });

  it('Should cancel internal subscription and MC if received cancel', async () => {
    const deactivatedAt: Date = new Date(23000);
    mockPaymentGatewayService.fetchSubscription.mockImplementation(async () => ({
      ...emptyExternalSubscription,
      status: ExternalSubscriptionStatus.CANCELLED,
    }));
    mockMyCarProductRepository.getBySubscriptionId.mockImplementation(async () => emptyMyCar);
    mockMyCarProductRepository.updateById.mockImplementation(async (_id: string, mc: MyCarProductDto) => ({
      ...emptyMyCar,
      ...mc,
    }));
    mockSubscriptionRepository.getById.mockImplementation(async () => emptySubscription);
    mockSubscriptionRepository.updateById.mockImplementation(async (_id: string, sub: SubscriptionDto) => ({
      ...emptySubscription,
      ...sub,
      deactivatedAt: deactivatedAt.toISOString(),
    }));

    const subscription: SubscriptionDto = await usecase
      .syncWithExternalReference(emptyExternalSubscription.ref, emptyExternalSubscription.idempotence)
      .unsafeRun();

    expect(mockPaymentGatewayService.fetchSubscription).toBeCalledWith(emptyExternalSubscription.ref, cnpj);
    expect(mockMyCarProductRepository.getBySubscriptionId).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockMyCarProductRepository.updateById).toBeCalledWith(emptyMyCar.id, {
      expiresAt: emptyExternalSubscription.expiresAt,
      status: MyCarProductStatusEnum.EXCLUDING,
    });
    expect(mockSubscriptionRepository.getById).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockSubscriptionRepository.updateById).toBeCalledWith(emptySubscription.id, {
      expiresAt: emptyExternalSubscription.expiresAt,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      status: SubscriptionStatus.CANCELLING,
    });

    expect(subscription).toEqual({
      ...emptySubscription,
      status: SubscriptionStatus.CANCELLING,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      expiresAt: emptyExternalSubscription.expiresAt,
      deactivatedAt: deactivatedAt.toISOString(),
    });
  });

  it('Should cancel subscription and exclude MC if external is terminated', async () => {
    const mockedDate: Date = new Date(21000);
    jest.spyOn(global, 'Date').mockImplementation(() => mockedDate as unknown as string);
    mockPaymentGatewayService.fetchSubscription.mockImplementation(async () => ({
      ...emptyExternalSubscription,
      status: ExternalSubscriptionStatus.TERMINATED,
    }));
    mockMyCarProductRepository.getBySubscriptionId.mockImplementation(async () => ({
      ...emptyMyCar,
    }));
    mockMyCarProductRepository.updateById.mockImplementation(async (_id: string, mc: MyCarProductDto) => ({
      ...emptyMyCar,
      ...mc,
    }));
    mockSubscriptionRepository.getById.mockImplementation(async () => ({
      ...emptySubscription,
    }));
    mockSubscriptionRepository.updateById.mockImplementation(async (_id: string, sub: SubscriptionDto) => ({
      ...emptySubscription,
      ...sub,
    }));

    const subscription: SubscriptionDto = await usecase
      .syncWithExternalReference(emptyExternalSubscription.ref, emptyExternalSubscription.idempotence)
      .unsafeRun();

    expect(mockPaymentGatewayService.fetchSubscription).toBeCalledWith(emptyExternalSubscription.ref, cnpj);
    expect(mockSubscriptionRepository.getById).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockSubscriptionRepository.updateById).toBeCalledWith(emptySubscription.id, {
      deactivatedAt: mockedDate.toISOString(),
      expiresAt: emptyExternalSubscription.expiresAt,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      status: SubscriptionStatus.CANCELED,
    });
    expect(mockMyCarProductRepository.getBySubscriptionId).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockMyCarProductRepository.updateById).toBeCalledWith(emptyMyCar.id, {
      deactivatedAt: mockedDate.toISOString(),
      expiresAt: emptyExternalSubscription.expiresAt,
      status: MyCarProductStatusEnum.EXCLUDED,
    });

    expect(subscription).toEqual({
      ...emptySubscription,
      deactivatedAt: mockedDate.toISOString(),
      status: SubscriptionStatus.CANCELED,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      expiresAt: emptyExternalSubscription.expiresAt,
    });
  });

  it('Should enable MC and subscription Paid after dued', async () => {
    const mockedDate: Date = new Date(21_100);
    mockPaymentGatewayService.fetchSubscription.mockImplementation(async () => ({
      ...emptyExternalSubscription,
      status: ExternalSubscriptionStatus.ACTIVE,
    }));
    mockMyCarProductRepository.getBySubscriptionId.mockImplementation(async () => ({
      ...emptyMyCar,
      status: MyCarProductStatusEnum.DEACTIVE,
      deactivatedAt: mockedDate.toISOString(),
    }));
    mockMyCarProductRepository.updateById.mockImplementation(async (_id: string, mc: MyCarProductDto) => ({
      ...emptyMyCar,
      ...mc,
      deactivatedAt: null,
    }));
    mockSubscriptionRepository.getById.mockImplementation(async () => ({
      ...emptySubscription,
      status: SubscriptionStatus.INACTIVE,
      deactivatedAt: mockedDate.toISOString(),
    }));
    mockSubscriptionRepository.updateById.mockImplementation(async (_id: string, sub: SubscriptionDto) => ({
      ...emptySubscription,
      ...sub,
    }));

    const subscription: SubscriptionDto = await usecase
      .syncWithExternalReference(emptyExternalSubscription.ref, emptyExternalSubscription.idempotence)
      .unsafeRun();

    expect(mockPaymentGatewayService.fetchSubscription).toBeCalledWith(emptyExternalSubscription.ref, cnpj);
    expect(mockSubscriptionRepository.getById).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockSubscriptionRepository.updateById).toBeCalledWith(emptySubscription.id, {
      deactivatedAt: null,
      expiresAt: emptyExternalSubscription.expiresAt,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      status: SubscriptionStatus.ACTIVE,
    });
    expect(mockMyCarProductRepository.getBySubscriptionId).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockMyCarProductRepository.updateById).toBeCalledWith(emptyMyCar.id, {
      deactivatedAt: null,
      expiresAt: emptyExternalSubscription.expiresAt,
      status: MyCarProductStatusEnum.ACTIVE,
    });

    expect(subscription).toEqual({
      ...emptySubscription,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: emptyExternalSubscription.expiresAt,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      deactivatedAt: null,
    });
  });

  it('Should disable NC if external subscription is dued', async () => {
    const mockedDate: Date = new Date(21100);
    jest.spyOn(global, 'Date').mockImplementation(() => mockedDate as unknown as string);
    mockPaymentGatewayService.fetchSubscription.mockImplementation(async () => ({
      ...emptyExternalSubscription,
      status: ExternalSubscriptionStatus.DUED,
    }));
    mockMyCarProductRepository.getBySubscriptionId.mockImplementation(async () => emptyMyCar);
    mockMyCarProductRepository.updateById.mockImplementation(async (_id: string, mc: MyCarProductDto) => ({
      ...emptyMyCar,
      ...mc,
    }));
    mockSubscriptionRepository.getById.mockImplementation(async () => emptySubscription);
    mockSubscriptionRepository.updateById.mockImplementation(async (_id: string, sub: SubscriptionDto) => ({
      ...emptySubscription,
      ...sub,
    }));

    const subscription: SubscriptionDto = await usecase
      .syncWithExternalReference(emptyExternalSubscription.ref, emptyExternalSubscription.idempotence)
      .unsafeRun();

    expect(mockPaymentGatewayService.fetchSubscription).toBeCalledWith(emptyExternalSubscription.ref, cnpj);
    expect(mockMyCarProductRepository.getBySubscriptionId).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockMyCarProductRepository.updateById).toBeCalledWith(emptyMyCar.id, {
      deactivatedAt: mockedDate.toISOString(),
      expiresAt: emptyExternalSubscription.expiresAt,
      status: MyCarProductStatusEnum.DEACTIVE,
    });
    expect(mockSubscriptionRepository.getById).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockSubscriptionRepository.updateById).toBeCalledWith(emptySubscription.id, {
      deactivatedAt: mockedDate.toISOString(),
      expiresAt: emptyExternalSubscription.expiresAt,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      status: SubscriptionStatus.INACTIVE,
    });

    expect(subscription).toEqual({
      ...emptySubscription,
      status: SubscriptionStatus.INACTIVE,
      expiresAt: emptyExternalSubscription.expiresAt,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      deactivatedAt: mockedDate.toISOString(),
    });
  });

  it('Should exclude MC and cancel subscription if external is expired', async () => {
    const mockedDate: Date = new Date(21_100);
    mockPaymentGatewayService.fetchSubscription.mockImplementation(async () => ({
      ...emptyExternalSubscription,
      status: ExternalSubscriptionStatus.EXPIRED,
    }));
    mockMyCarProductRepository.getBySubscriptionId.mockImplementation(async () => ({
      ...emptyMyCar,
      deactivatedAt: mockedDate.toISOString(),
    }));
    mockMyCarProductRepository.updateById.mockImplementation(async (_id: string, mc: MyCarProductDto) => ({
      ...emptyMyCar,
      ...mc,
      deactivatedAt: mockedDate.toISOString(),
    }));
    mockSubscriptionRepository.getById.mockImplementation(async () => ({
      ...emptySubscription,
      deactivatedAt: mockedDate.toISOString(),
    }));
    mockSubscriptionRepository.updateById.mockImplementation(async (_id: string, sub: SubscriptionDto) => ({
      ...emptySubscription,
      ...sub,
    }));

    const subscription: SubscriptionDto = await usecase
      .syncWithExternalReference(emptyExternalSubscription.ref, emptyExternalSubscription.idempotence)
      .unsafeRun();

    expect(mockPaymentGatewayService.fetchSubscription).toBeCalledWith(emptyExternalSubscription.ref, cnpj);
    expect(mockSubscriptionRepository.getById).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockSubscriptionRepository.updateById).toBeCalledWith(emptySubscription.id, {
      expiresAt: emptyExternalSubscription.expiresAt,
      nextChargeAt: emptyExternalSubscription.chargeAt,
      status: SubscriptionStatus.INACTIVE,
    });
    expect(mockMyCarProductRepository.getBySubscriptionId).toBeCalledWith(emptyExternalSubscription.idempotence);
    expect(mockMyCarProductRepository.updateById).toBeCalledWith(emptyMyCar.id, {
      deactivatedAt: undefined,
      expiresAt: emptyExternalSubscription.expiresAt,
      status: MyCarProductStatusEnum.DEACTIVE,
    });

    expect(subscription).toEqual({
      ...emptySubscription,
      status: SubscriptionStatus.INACTIVE,
      expiresAt: emptyExternalSubscription.expiresAt,
      nextChargeAt: emptyExternalSubscription.chargeAt,
    });
  });

  it('Should throw error if MC is not preemium', async () => {
    mockMyCarProductRepository.getBySubscriptionId.mockImplementation(async () => ({
      ...emptyMyCar,
      type: MyCarProductTypeEnum.FREEMIUM,
    }));

    await expect(
      usecase
        .syncWithExternalReference(emptyExternalSubscription.ref, emptyExternalSubscription.idempotence)
        .unsafeRun(),
    ).rejects.toThrow(NoSubscriptionFoundDomainError);

    expect(mockSubscriptionRepository.getById).toBeCalledWith(emptyExternalSubscription.idempotence);
  });
});
