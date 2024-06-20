import {
  MyCarKeys,
  MyCarProductEntity,
  MyCarProductStatusEnum,
  MyCarProductTypeEnum,
} from 'src/domain/_entity/my-car-product.entity';
import { PlanGateway, PlanIntervalFrequency, PlanPayableWith, PlanStatus } from 'src/domain/_entity/plan.entity';
import {
  MyCarAlreadyExistsDomainError,
  MyCarIsAlreadyRegisteredDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
} from 'src/domain/_entity/result.error';
import { SubscriptionGateway } from 'src/domain/_entity/subscription.entity';
import {
  ExternalSubscriptionDto,
  ExternalSubscriptionRecurringCycle,
  ExternalSubscriptionStatus,
} from 'src/domain/_layer/data/dto/external-subscription.dto';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { PlanDto } from 'src/domain/_layer/data/dto/plan.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { PlanRepository } from 'src/domain/_layer/infrastructure/repository/plan.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { PlanAvailabilityHelper } from '../plan-availability.helper';
import { RegisterMyCarUseCase } from '../register-my-car.use-case';

const mockMyCarKeys: QueryResponseDto = {
  status: 'SUCCESS',
  keys: {
    brand: '',
    modelBrandCode: 123,
    chassis: 'chassiss',
    plate: 'plate',
    model: 'model',
    fipeId: '123123',
    modelYear: 'modelYear',
    engine: 'engine',
    engineCapacity: 'engineCapacity',
    zipCode: '123123',
  },
  response: {
    basicVehicle: {
      version: 'fipeName',
    },
    revision: [
      {
        fipeId: 123123,
        versionId: 10,
      },
    ],
  },
} as unknown as QueryResponseDto;

describe(RegisterMyCarUseCase.name, () => {
  let registerMyCarUseCase: RegisterMyCarUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockMyCarProductRepository: jest.Mocked<MyCarProductRepository>;
  let mockSubscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let mockPlanRepository: jest.Mocked<PlanRepository>;
  let mockQueryRequestService: jest.Mocked<QueryRequestService>;
  let mockPaymentGatewayService: jest.Mocked<PaymentGatewayService>;
  let mockEnvService: jest.Mocked<EnvService>;
  const userId: string = 'some-user-id';
  const plate: string = 'some-plate';
  const fipeId: string = '123123';
  const creditCardId: string = 'card-id';
  const userExampleMock: UserDto = {
    billingId: 1,
    id: userId,
  } as unknown as UserDto;
  const testingEmail: string = 'testing@email.t';
  const specialUserExampleMock: UserDto = {
    billingId: 1,
    email: testingEmail,
    id: userId,
  } as unknown as UserDto;
  const plan: PlanDto = {
    id: 'plan-id',
    userId: '',
    name: '',
    description: '',
    status: PlanStatus.ACTIVE,
    intervalValue: 0,
    intervalFrequency: PlanIntervalFrequency.MONTHS,
    costInCents: 0,
    payableWith: PlanPayableWith.CREDIT_CARD,
    gatewayRef: '',
    gateway: PlanGateway.ARC,
    addCredits: false,
    deactivatedAt: '',
    createdAt: '',
    updatedAt: '',
  };
  const extSubscription: ExternalSubscriptionDto = {
    creditCard: null,
    creditCardRef: creditCardId,
    ref: 'subscription-id',
    idempotence: '',
    status: ExternalSubscriptionStatus.ACTIVE,
    recurringCycle: ExternalSubscriptionRecurringCycle.MONTHLY,
    recurringValueInCents: 0,
    daysBeforeExpire: 0,
    chargeAt: '',
    dueAt: '',
    expiresAt: new Date(1_100).toISOString(),
    customerRef: '',
    strategyRef: '',
    createdAt: '',
    gateway: SubscriptionGateway.ARC,
  };

  beforeEach(async () => {
    mockUserRepository = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockMyCarProductRepository = {
      getActiveByKeys: jest.fn(() => []),
      hasActiveProduct: jest.fn(() => null),
      countByUserId: jest.fn(),
      insert: jest.fn(
        ({ keys }: { readonly keys: MyCarKeys }) =>
          ({
            billingId: 1,
            id: 1,
            keys,
          } as unknown as MyCarProductDto),
      ),
    } as unknown as jest.Mocked<MyCarProductRepository>;

    mockSubscriptionRepository = {
      insert: jest.fn(
        () =>
          ({
            id: 1,
          } as unknown as SubscriptionDto),
      ),
      generateNewId: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;

    mockPlanRepository = {
      getById: jest.fn(async () => plan),
    } as unknown as jest.Mocked<PlanRepository>;

    mockQueryRequestService = {
      requestQuery: jest.fn(() => null),
      getAsyncQueryByReference: jest.fn(),
    } as unknown as jest.Mocked<QueryRequestService>;

    mockEnvService = {
      isProdEnv: jest.fn(),
      get: jest.fn(() => plan.id),
    } as unknown as jest.Mocked<EnvService>;

    mockPaymentGatewayService = {
      getCreditCardOfUser: jest.fn(),
      createSubscription: jest.fn(),
    } as unknown as jest.Mocked<PaymentGatewayService>;

    const mockPlanAvailabilityHelper: PlanAvailabilityHelper = new PlanAvailabilityHelper(
      mockMyCarProductRepository,
      mockEnvService,
    );

    mockPlanAvailabilityHelper._specialUsersWithoutLimits = [testingEmail];

    registerMyCarUseCase = new RegisterMyCarUseCase(
      mockUserRepository,
      mockMyCarProductRepository,
      mockQueryRequestService,
      mockPlanAvailabilityHelper,
      mockPaymentGatewayService,
      mockSubscriptionRepository,
      mockPlanRepository,
      mockEnvService,
    );

    await registerMyCarUseCase.onModuleInit();
  });

  describe('registerPlate', () => {
    it('should successfully register a car', async () => {
      mockEnvService.isProdEnv.mockReturnValue(true);
      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockMyCarProductRepository.countByUserId.mockResolvedValue(0); // Assuming the car does not exist
      mockQueryRequestService.getAsyncQueryByReference.mockResolvedValue(mockMyCarKeys);

      const result: MyCarProductEntity = await registerMyCarUseCase.registerPlate(userId, plate, fipeId).unsafeRun();

      expect(result).toEqual({
        billingId: 1,
        id: 1,
        keys: {
          brand: '',
          brandModelCode: '123',
          chassis: 'chassiss',
          plate: 'plate',
          model: 'model',
          fipeName: 'fipeName',
          fipeId: '123123',
          modelYear: 'modelYear',
          engineNumber: 'engine',
          engineCapacity: 'engineCapacity',
          zipCode: '123123',
          versionId: '10',
        },
      } as unknown as MyCarProductDto);
    });

    it('should throw an error when user is not found', async () => {
      mockEnvService.isProdEnv.mockReturnValue(true);
      mockUserRepository.getById.mockResolvedValue(null);

      await expect(registerMyCarUseCase.registerPlate(userId, plate, fipeId).unsafeRun()).rejects.toThrow(
        NoUserFoundDomainError,
      );
    });

    it('should throw an error when car already exists', async () => {
      mockEnvService.isProdEnv.mockReturnValue(true);
      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockQueryRequestService.getAsyncQueryByReference.mockResolvedValue(mockMyCarKeys);
      mockMyCarProductRepository.countByUserId.mockResolvedValue(1);

      await expect(registerMyCarUseCase.registerPlate(userId, plate, fipeId).unsafeRun()).rejects.toThrow(
        MyCarAlreadyExistsDomainError,
      );
    });

    it('should throw MyCarIsAlreadyRegisteredDomainError if the car is already registered', async () => {
      // Arrange
      mockEnvService.isProdEnv.mockReturnValue(true);
      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockMyCarProductRepository.hasActiveProduct.mockResolvedValue(true);

      // Act and Assert
      await expect(registerMyCarUseCase.registerPlate(userId, plate, fipeId).unsafeRun()).rejects.toThrow(
        MyCarIsAlreadyRegisteredDomainError,
      );
    });

    it('should allow special user to register another car freely', async () => {
      mockEnvService.isProdEnv.mockReturnValue(false);
      mockUserRepository.getById.mockResolvedValue(specialUserExampleMock);
      mockQueryRequestService.getAsyncQueryByReference.mockResolvedValue(mockMyCarKeys);
      mockMyCarProductRepository.countByUserId.mockResolvedValue(1);

      const result: MyCarProductEntity = await registerMyCarUseCase.registerPlate(userId, plate, fipeId).unsafeRun();

      expect(result).toEqual({
        billingId: 1,
        id: 1,
        keys: {
          brand: '',
          brandModelCode: '123',
          chassis: 'chassiss',
          plate: 'plate',
          model: 'model',
          fipeName: 'fipeName',
          fipeId: '123123',
          modelYear: 'modelYear',
          engineNumber: 'engine',
          engineCapacity: 'engineCapacity',
          zipCode: '123123',
          versionId: '10',
        },
      } as unknown as MyCarProductDto);
    });

    it('should throw an error when car already exists even for special user because of environment', async () => {
      mockEnvService.isProdEnv.mockReturnValue(true);
      mockUserRepository.getById.mockResolvedValue(specialUserExampleMock);
      mockQueryRequestService.getAsyncQueryByReference.mockResolvedValue(mockMyCarKeys);
      mockMyCarProductRepository.countByUserId.mockResolvedValue(1);

      await expect(registerMyCarUseCase.registerPlate(userId, plate, fipeId).unsafeRun()).rejects.toThrow(
        MyCarAlreadyExistsDomainError,
      );
    });
  });

  describe('registerPlate with subscription', () => {
    it('should register plate with credit card being the second car', async () => {
      const newSubId: string = 'new-sub';
      mockEnvService.isProdEnv.mockReturnValue(true);
      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockQueryRequestService.getAsyncQueryByReference.mockResolvedValue(mockMyCarKeys);
      mockMyCarProductRepository.countByUserId.mockResolvedValue(1);
      mockPaymentGatewayService.createSubscription.mockResolvedValue(extSubscription);
      mockMyCarProductRepository.insert.mockImplementation(async (v: MyCarProductDto) => v);
      mockSubscriptionRepository.generateNewId.mockImplementation(() => extSubscription.idempotence);
      mockSubscriptionRepository.insert.mockImplementation(
        async (v: SubscriptionDto) =>
          ({
            ...v,
            id: newSubId,
          } as SubscriptionDto),
      );

      const result: MyCarProductEntity = await registerMyCarUseCase
        .registerPlate(userId, plate, fipeId, creditCardId)
        .unsafeRun();

      expect(mockPaymentGatewayService.createSubscription).toBeCalledTimes(1);

      expect(result).toEqual({
        billingId: userExampleMock.billingId,
        subscriptionId: newSubId,
        status: MyCarProductStatusEnum.ACTIVE,
        deactivatedAt: null,
        deletedAt: null,
        expiresAt: new Date(1_100).toISOString(),
        type: MyCarProductTypeEnum.PREMIUM,
        keys: {
          brand: '',
          brandModelCode: '123',
          chassis: 'chassiss',
          plate: 'plate',
          model: 'model',
          fipeName: 'fipeName',
          fipeId: '123123',
          modelYear: mockMyCarKeys.keys.modelYear,
          engineNumber: 'engine',
          engineCapacity: 'engineCapacity',
          zipCode: '123123',
          versionId: '10',
        },
      });
    });

    it('should not create subscription if requesting query service got error', async () => {
      mockEnvService.isProdEnv.mockReturnValue(true);
      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockQueryRequestService.requestQuery.mockRejectedValue(null); // error

      await expect(registerMyCarUseCase.registerPlate(userId, plate, fipeId, creditCardId).unsafeRun()).rejects.toThrow(
        ProviderUnavailableDomainError,
      );

      expect(mockSubscriptionRepository.insert).toBeCalledTimes(0);
      expect(mockMyCarProductRepository.insert).toBeCalledTimes(0);
      expect(mockPaymentGatewayService.createSubscription).toBeCalledTimes(0);
    });

    it('should not create subscription if fetching query service got error', async () => {
      mockEnvService.isProdEnv.mockReturnValue(true);
      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockQueryRequestService.getAsyncQueryByReference.mockRejectedValue(null); // error

      await expect(registerMyCarUseCase.registerPlate(userId, plate, fipeId, creditCardId).unsafeRun()).rejects.toThrow(
        ProviderUnavailableDomainError,
      );

      expect(mockSubscriptionRepository.insert).toBeCalledTimes(0);
      expect(mockMyCarProductRepository.insert).toBeCalledTimes(0);
      expect(mockPaymentGatewayService.createSubscription).toBeCalledTimes(0);
    });

    it('should let user pay a my car without using first available free', async () => {
      const newSubId: string = 'new-sub';
      mockEnvService.isProdEnv.mockReturnValue(true);
      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockQueryRequestService.getAsyncQueryByReference.mockResolvedValue(mockMyCarKeys);
      mockMyCarProductRepository.countByUserId.mockResolvedValue(0);
      mockPaymentGatewayService.createSubscription.mockResolvedValue(extSubscription);
      mockMyCarProductRepository.insert.mockImplementation(async (v: MyCarProductDto) => v);
      mockSubscriptionRepository.generateNewId.mockImplementation(() => extSubscription.idempotence);
      mockSubscriptionRepository.insert.mockImplementation(
        async (v: SubscriptionDto) =>
          ({
            ...v,
            id: newSubId,
          } as SubscriptionDto),
      );

      const result: MyCarProductEntity = await registerMyCarUseCase
        .registerPlate(userId, plate, fipeId, creditCardId)
        .unsafeRun();

      expect(mockPaymentGatewayService.createSubscription).toBeCalledTimes(1);

      expect(result).toEqual({
        billingId: userExampleMock.billingId,
        subscriptionId: newSubId,
        status: MyCarProductStatusEnum.ACTIVE,
        deactivatedAt: null,
        deletedAt: null,
        expiresAt: new Date(1_100).toISOString(),
        type: MyCarProductTypeEnum.PREMIUM,
        keys: {
          brand: '',
          brandModelCode: '123',
          chassis: 'chassiss',
          plate: 'plate',
          model: 'model',
          fipeName: 'fipeName',
          fipeId: '123123',
          modelYear: mockMyCarKeys.keys.modelYear,
          engineNumber: 'engine',
          engineCapacity: 'engineCapacity',
          zipCode: '123123',
          versionId: '10',
        },
      });
    });

    // it('should throw error if card was rejected (wrong id for customer, invalid card)', () => {});
  });
});
