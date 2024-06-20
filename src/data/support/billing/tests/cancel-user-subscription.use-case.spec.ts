import { SyncWithExternalSubscriptionHelper } from 'src/data/shared/sync-with-external-subscription.helper';
import { MyCarProductStatusEnum } from 'src/domain/_entity/my-car-product.entity';
import { PlanPayableWith, PlanTag } from 'src/domain/_entity/plan.entity';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { SubscriptionGateway, SubscriptionStatus } from 'src/domain/_entity/subscription.entity';
import {
  ExternalSubscriptionDto,
  ExternalSubscriptionStatus,
} from 'src/domain/_layer/data/dto/external-subscription.dto';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { CancelUserSubscriptionUseCase } from '../cancel-user-subscription.use-case';

describe('CancelUserSubscriptionUseCase', () => {
  let mockSubscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPaymentGatewayService: jest.Mocked<PaymentGatewayService>;
  let mockMyCarProductRepository: jest.Mocked<MyCarProductRepository>;
  let envService: jest.Mocked<EnvService>;
  let usecase: CancelUserSubscriptionUseCase;

  const cnpj: string = 'cnpj';
  const userMock: UserDto = {
    billingId: '1',
    id: '',
  } as unknown as UserDto;
  const subscriptionMock: SubscriptionDto = {
    id: 'sub-id',
    userId: '',
    planId: '',
    billingId: userMock.id,
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
  const myCarMock: MyCarProductDto = {
    billingId: userMock.billingId,
    subscriptionId: subscriptionMock.id,
  } as unknown as MyCarProductDto;

  beforeEach(() => {
    mockSubscriptionRepository = {
      updateById: jest.fn(),
      getByIdOwnedByUser: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;
    mockUserRepository = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    mockPaymentGatewayService = {
      cancelSubscription: jest.fn(),
    } as unknown as jest.Mocked<PaymentGatewayService>;
    mockMyCarProductRepository = {
      getBySubscriptionId: jest.fn(),
      updateById: jest.fn(),
    } as unknown as jest.Mocked<MyCarProductRepository>;
    envService = {
      get: jest.fn(() => cnpj),
    } as unknown as jest.Mocked<EnvService>;

    const syncWithExternalSubscriptionHelper: SyncWithExternalSubscriptionHelper =
      new SyncWithExternalSubscriptionHelper(mockSubscriptionRepository, mockMyCarProductRepository);

    usecase = new CancelUserSubscriptionUseCase(
      mockSubscriptionRepository,
      mockMyCarProductRepository,
      mockUserRepository,
      mockPaymentGatewayService,
      syncWithExternalSubscriptionHelper,
      envService,
    );
  });

  it('Cancel a subscription normally', async () => {
    const expiresAt: string = new Date(22_000).toISOString();
    const chargeAt: string = new Date(21_000).toISOString();
    mockSubscriptionRepository.getByIdOwnedByUser.mockImplementation(async () => subscriptionMock);
    mockUserRepository.getById.mockImplementation(async () => userMock);
    mockPaymentGatewayService.cancelSubscription.mockImplementation(
      async () =>
        ({
          status: ExternalSubscriptionStatus.CANCELLED,
          idempotence: subscriptionMock.id,
          chargeAt,
          expiresAt,
        } as ExternalSubscriptionDto),
    );
    mockSubscriptionRepository.updateById.mockImplementation(async (_id: string, upd: Partial<SubscriptionDto>) => ({
      ...subscriptionMock,
      ...upd,
    }));
    mockMyCarProductRepository.getBySubscriptionId.mockImplementation(async () => myCarMock);
    mockMyCarProductRepository.updateById.mockImplementation(async (_id: string, upd: Partial<MyCarProductDto>) => ({
      ...myCarMock,
      ...upd,
    }));

    const result: SubscriptionDto = await usecase.cancelById(subscriptionMock.id, userMock.id).unsafeRun();

    expect(mockSubscriptionRepository.updateById).toHaveBeenCalledWith(subscriptionMock.id, {
      status: SubscriptionStatus.CANCELLING,
      nextChargeAt: chargeAt,
      expiresAt,
    } as Partial<SubscriptionDto>);
    expect(mockMyCarProductRepository.getBySubscriptionId).toHaveBeenCalledWith(subscriptionMock.id);
    expect(mockMyCarProductRepository.updateById).toHaveBeenCalledWith(myCarMock.id, {
      status: MyCarProductStatusEnum.EXCLUDING,
      expiresAt,
    } as Partial<MyCarProductDto>);

    expect(result).toEqual({
      ...subscriptionMock,
      expiresAt,
      nextChargeAt: chargeAt,
      status: SubscriptionStatus.CANCELLING,
    });
  });

  it('Try to cancel a subscription but gateway fails', async () => {
    mockSubscriptionRepository.getByIdOwnedByUser.mockImplementation(async () => subscriptionMock);
    mockUserRepository.getById.mockImplementation(async () => userMock);
    mockPaymentGatewayService.cancelSubscription.mockRejectedValue(null);

    const toResolve: Promise<SubscriptionDto> = usecase.cancelById(subscriptionMock.id, userMock.id).unsafeRun();
    await expect(toResolve).rejects.toThrow(ProviderUnavailableDomainError);

    expect(mockSubscriptionRepository.updateById).toHaveBeenCalledTimes(0);
    expect(mockMyCarProductRepository.getBySubscriptionId).toHaveBeenCalledTimes(0);
    expect(mockMyCarProductRepository.updateById).toHaveBeenCalledTimes(0);
  });
});
