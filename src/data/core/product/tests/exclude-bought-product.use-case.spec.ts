import { SyncWithExternalSubscriptionHelper } from 'src/data/shared/sync-with-external-subscription.helper';
import { MyCarProductStatusEnum } from 'src/domain/_entity/my-car-product.entity';
import { PlanPayableWith, PlanTag } from 'src/domain/_entity/plan.entity';
import { MyCarInvalidStateDomainError, NotFoundMyCarDomainError } from 'src/domain/_entity/result.error';
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
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { ExcludeProductUseCase } from '../exclude-bought-product.use-case';

describe(ExcludeProductUseCase.name, () => {
  let usecase: ExcludeProductUseCase;
  let mockMyCarProductRepository: jest.Mocked<MyCarProductRepository>;
  let mockSubscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let mockPaymentGatewayService: jest.Mocked<PaymentGatewayService>;
  let envService: jest.Mocked<EnvService>;

  const cnpj: string = 'cnpj';
  const userMock: UserDto = {
    billingId: '1',
    id: 'user-id',
  } as unknown as UserDto;
  const subscriptionMock: SubscriptionDto = {
    id: 'sub-id',
    userId: userMock.id,
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
    id: 'car-id',
    billingId: userMock.billingId,
    subscriptionId: subscriptionMock.id,
    status: MyCarProductStatusEnum.ACTIVE,
  } as unknown as MyCarProductDto;

  beforeEach(() => {
    mockSubscriptionRepository = {
      updateById: jest.fn(),
      getById: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;

    mockMyCarProductRepository = {
      getBySubscriptionId: jest.fn(),
      updateById: jest.fn(),
      getByIdOwnedByUser: jest.fn(),
    } as unknown as jest.Mocked<MyCarProductRepository>;

    mockPaymentGatewayService = {
      cancelSubscription: jest.fn(),
    } as unknown as jest.Mocked<PaymentGatewayService>;

    envService = {
      get: jest.fn(() => cnpj),
    } as unknown as jest.Mocked<EnvService>;

    const syncWithExternalSubscriptionHelper: SyncWithExternalSubscriptionHelper =
      new SyncWithExternalSubscriptionHelper(mockSubscriptionRepository, mockMyCarProductRepository);

    usecase = new ExcludeProductUseCase(
      mockMyCarProductRepository,
      mockSubscriptionRepository,
      syncWithExternalSubscriptionHelper,
      mockPaymentGatewayService,
      envService,
    );
  });

  describe('excludeById', () => {
    it('should exclude the MC for a given user', async () => {
      const expiresAt: string = new Date(22_000).toISOString();
      const chargeAt: string = new Date(21_000).toISOString();
      mockSubscriptionRepository.getById.mockImplementation(async () => subscriptionMock);
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
      mockMyCarProductRepository.getByIdOwnedByUser.mockImplementation(async () => myCarMock);
      mockMyCarProductRepository.updateById.mockImplementation(async (_id: string, upd: Partial<MyCarProductDto>) => ({
        ...myCarMock,
        ...upd,
      }));

      const result: MyCarProductDto = await usecase.excludeById(myCarMock.id, userMock.id).unsafeRun();

      expect(mockSubscriptionRepository.updateById).toHaveBeenCalledWith(subscriptionMock.id, {
        status: SubscriptionStatus.CANCELLING,
        nextChargeAt: chargeAt,
        expiresAt,
      } as Partial<SubscriptionDto>);
      expect(mockMyCarProductRepository.getByIdOwnedByUser).toHaveBeenCalledWith(myCarMock.id, userMock.id);
      expect(mockMyCarProductRepository.updateById).toHaveBeenCalledWith(myCarMock.id, {
        status: MyCarProductStatusEnum.EXCLUDED,
        expiresAt,
      } as Partial<MyCarProductDto>);

      expect(result).toEqual({
        ...myCarMock,
        expiresAt,
        status: MyCarProductStatusEnum.EXCLUDED,
      });
    });

    it('Should update car status to EXCLUDED when there is no subscription', async () => {
      mockMyCarProductRepository.getByIdOwnedByUser.mockImplementation(async () => myCarMock);
      mockSubscriptionRepository.getById.mockResolvedValue(null);
      mockMyCarProductRepository.updateById.mockImplementation(async (_id: string, upd: Partial<MyCarProductDto>) => ({
        ...myCarMock,
        ...upd,
      }));

      const result: MyCarProductDto = await usecase.excludeById(myCarMock.id, userMock.id).unsafeRun();
      expect(result).toEqual({
        ...myCarMock,
        status: MyCarProductStatusEnum.EXCLUDED,
      });
    });

    it('should throw an error if MC is excluded', async () => {
      mockMyCarProductRepository.getByIdOwnedByUser.mockImplementation(async () => ({
        ...myCarMock,
        status: MyCarProductStatusEnum.EXCLUDED,
      }));

      await expect(usecase.excludeById(myCarMock.id, userMock.id).unsafeRun()).rejects.toThrow(
        MyCarInvalidStateDomainError,
      );

      expect(mockMyCarProductRepository.getByIdOwnedByUser).toHaveBeenCalledWith(myCarMock.id, userMock.id);
    });

    it('should throw an error if the product is not found', async () => {
      mockMyCarProductRepository.getByIdOwnedByUser.mockImplementation(async () => null);

      await expect(usecase.excludeById(myCarMock.id, userMock.id).unsafeRun()).rejects.toThrow(
        NotFoundMyCarDomainError,
      );

      expect(mockMyCarProductRepository.getByIdOwnedByUser).toHaveBeenCalledWith(myCarMock.id, userMock.id);
    });

    it("should throw an error if product doesn't belong to user", async () => {
      const anotherUserId: string = 'another-user';
      mockMyCarProductRepository.getByIdOwnedByUser.mockImplementation(async () => null);

      await expect(usecase.excludeById(myCarMock.id, anotherUserId).unsafeRun()).rejects.toThrow(
        NotFoundMyCarDomainError,
      );

      expect(mockMyCarProductRepository.getByIdOwnedByUser).toHaveBeenCalledWith(myCarMock.id, anotherUserId);
    });
  });
});
