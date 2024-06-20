import { MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { PlanGateway, PlanIntervalFrequency, PlanPayableWith, PlanStatus } from 'src/domain/_entity/plan.entity';
import {
  MyCarInvalidStateDomainError,
  NoUserFoundDomainError,
  NotFoundMyCarDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { PlanDto } from 'src/domain/_layer/data/dto/plan.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { PlanRepository } from 'src/domain/_layer/infrastructure/repository/plan.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { PlanAvailabilityHelper } from '../plan-availability.helper';
import { RegisterMyCarUseCase } from '../register-my-car.use-case';
import { UpgradeMyCarProductToPremiumUseCase } from '../upgrade-my-car-product-to-premium.use-case';

describe(RegisterMyCarUseCase.name, () => {
  let usecase: UpgradeMyCarProductToPremiumUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockMyCarProductRepository: jest.Mocked<MyCarProductRepository>;
  let mockSubscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let mockPlanRepository: jest.Mocked<PlanRepository>;
  let mockPaymentGatewayService: jest.Mocked<PaymentGatewayService>;
  let mockEnvService: jest.Mocked<EnvService>;
  const mockUser: UserDto = {
    billingId: 'billing-id',
    createdAt: new Date().toISOString(),
    deletedAt: null,
    email: 'some-email',
    id: 'user-id',
    name: 'some-name',
    cpf: '',
    phoneNumber: '',
    address: null,
    type: null,
    lastLogin: '',
    status: false,
    creationOrigin: null,
    company: null,
    hierarchy: null,
    externalControls: null,
    whenDeletedAt: '',
  };
  const creditCardId: string = 'card-id';
  const mockMyCar: MyCarProductDto = {
    billingId: mockUser.billingId,
    createdAt: new Date().toISOString(),
    deactivatedAt: null,
    deletedAt: null,
    expiresAt: null,
    fineConfig: null,
    id: 'product-id',
    keys: null,
    onQueryConfig: null,
    priceFIPEConfig: null,
    revisionConfig: null,
    status: MyCarProductStatusEnum.ACTIVE,
    subscriptionId: null,
    type: MyCarProductTypeEnum.FREEMIUM,
    updatedAt: new Date().toISOString(),
  };
  const testingEmail: string = 'testing@email.t';
  const mockPlan: PlanDto = {
    id: 'plan-id',
    userId: '',
    name: '',
    description: '',
    status: PlanStatus.ACTIVE,
    intervalValue: 0,
    intervalFrequency: PlanIntervalFrequency.MONTHS,
    costInCents: 0,
    payableWith: PlanPayableWith.CREDIT_CARD,
    gatewayRef: 'gtw-ref',
    gateway: PlanGateway.ARC,
    addCredits: false,
    deactivatedAt: '',
    createdAt: '',
    updatedAt: '',
  };

  // const extSubscription: ExternalSubscriptionDto = {
  //   creditCardRef: creditCardId,
  //   ref: 'subscription-id',
  //   idempotence: '',
  //   status: ExternalSubscriptionStatus.ACTIVE,
  //   recurringCycle: ExternalSubscriptionRecurringCycle.MONTHLY,
  //   recurringValueInCents: 0,
  //   daysBeforeExpire: 0,
  //   dueAt: '',
  //   expiresAt: new Date(1_100).toISOString(),
  //   customerRef: '',
  //   strategyRef: '',
  //   createdAt: '',
  //   gateway: SubscriptionGateway.ARC,
  // };

  beforeEach(async () => {
    mockUserRepository = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockMyCarProductRepository = {
      getByIdOwnedByUser: jest.fn(),
      updateById: jest.fn(),
    } as unknown as jest.Mocked<MyCarProductRepository>;

    mockSubscriptionRepository = {
      insert: jest.fn(
        () =>
          ({
            id: 1,
          } as unknown as SubscriptionDto),
      ),
    } as unknown as jest.Mocked<SubscriptionRepository>;

    mockPlanRepository = {
      getById: jest.fn(async () => mockPlan),
    } as unknown as jest.Mocked<PlanRepository>;

    mockEnvService = {
      isProdEnv: jest.fn(),
      get: jest.fn(() => mockPlan.id),
    } as unknown as jest.Mocked<EnvService>;

    mockPaymentGatewayService = {
      createSubscription: jest.fn(),
    } as unknown as jest.Mocked<PaymentGatewayService>;

    const mockPlanAvailabilityHelper: PlanAvailabilityHelper = new PlanAvailabilityHelper(
      mockMyCarProductRepository,
      mockEnvService,
    );

    mockPlanAvailabilityHelper._specialUsersWithoutLimits = [testingEmail];

    usecase = new UpgradeMyCarProductToPremiumUseCase(
      mockUserRepository,
      mockMyCarProductRepository,
      mockPaymentGatewayService,
      mockSubscriptionRepository,
      mockPlanRepository,
      mockEnvService,
    );

    await usecase.onModuleInit();
  });

  describe('registerPlate', () => {
    // it('should successfully upgrade a MC', async () => {
    //   const newSubscriptionId: string = 'id';
    //   mockUserRepository.getById.mockImplementation(async () => mockUser);
    //   mockMyCarProductRepository.getByIdOwnedByUser.mockImplementation(async () => mockMyCar);
    //   mockPaymentGatewayService.createSubscription.mockImplementation(async () => extSubscription);
    //   mockSubscriptionRepository.insert.mockImplementation(async (sub: SubscriptionDto) => ({
    //     ...sub,
    //     id: newSubscriptionId,
    //   }));
    //   mockMyCarProductRepository.updateById.mockImplementation(async (id: string, myCar: MyCarProductDto) => ({
    //     id,
    //     ...mockMyCar,
    //     ...myCar,
    //   }));

    //   const result: SubscriptionDto = await usecase.upgrade(mockMyCar.id, mockUser.id, creditCardId).unsafeRun();

    //   const expecSubscription: Partial<SubscriptionDto> = {
    //     planId: mockPlan.id,
    //     billingId: mockUser.billingId,
    //     paymentIds: [],
    //     gateway: SubscriptionGateway.ARC,
    //     gatewayRef: extSubscription.ref,
    //     paymentMethod: PlanPayableWith.CREDIT_CARD,
    //     ignoreBillingNotification: true,
    //     status: SubscriptionStatus.ACTIVE,
    //     planTag: PlanTag.MY_CARS,
    //     deactivatedAt: null,
    //     nextChargeAt: extSubscription.dueAt,
    //     expiresAt: extSubscription.expiresAt,
    //   };
    //   expect(mockUserRepository.getById).toBeCalledWith(mockUser.id);
    //   expect(mockMyCarProductRepository.getByIdOwnedByUser).toBeCalledWith(mockMyCar.id, mockUser.id);
    //   expect(mockPaymentGatewayService.createSubscription).toBeCalledWith(
    //     mockUser.id,
    //     creditCardId,
    //     {},
    //     UpgradeMyCarProductToPremiumUseCase._originalCnpj,
    //   );
    //   expect(mockSubscriptionRepository.insert).toBeCalledWith(expecSubscription);
    //   expect(mockMyCarProductRepository.updateById).toBeCalledWith(mockMyCar.id, {
    //     expiresAt: extSubscription.expiresAt,
    //     status: MyCarProductStatusEnum.ACTIVE,
    //     subscriptionId: newSubscriptionId,
    //     type: MyCarProductTypeEnum.PREMIUM,
    //   });

    //   expect(result).toEqual({ id: newSubscriptionId, ...expecSubscription });
    // });

    // it('should error if creating subscription externally fails', async () => {
    //   mockUserRepository.getById.mockImplementation(async () => mockUser);
    //   mockMyCarProductRepository.getByIdOwnedByUser.mockImplementation(async () => mockMyCar);
    //   mockPaymentGatewayService.createSubscription.mockRejectedValue(null);

    //   await expect(usecase.upgrade(mockMyCar.id, mockUser.id, creditCardId).unsafeRun()).rejects.toThrow(
    //     ProviderUnavailableDomainError,
    //   );

    //   expect(mockUserRepository.getById).toBeCalledWith(mockUser.id);
    //   expect(mockMyCarProductRepository.getByIdOwnedByUser).toBeCalledWith(mockMyCar.id, mockUser.id);
    //   expect(mockPaymentGatewayService.createSubscription).toBeCalledWith(
    //     mockUser.id,
    //     creditCardId,
    //     {},
    //     UpgradeMyCarProductToPremiumUseCase._originalCnpj,
    //   );
    // });

    it('should error out if MC is not active', async () => {
      mockUserRepository.getById.mockImplementation(async () => mockUser);
      mockMyCarProductRepository.getByIdOwnedByUser.mockImplementation(async () => ({
        ...mockMyCar,
        status: MyCarProductStatusEnum.DEACTIVE,
      }));

      await expect(usecase.upgrade(mockMyCar.id, mockUser.id, creditCardId).unsafeRun()).rejects.toThrow(
        MyCarInvalidStateDomainError,
      );

      expect(mockUserRepository.getById).toBeCalledWith(mockUser.id);
      expect(mockMyCarProductRepository.getByIdOwnedByUser).toBeCalledWith(mockMyCar.id, mockUser.id);
    });

    it("should error out if MC wasn't found", async () => {
      mockUserRepository.getById.mockImplementation(async () => mockUser);
      mockMyCarProductRepository.getByIdOwnedByUser.mockImplementation(async () => null);

      await expect(usecase.upgrade(mockMyCar.id, mockUser.id, creditCardId).unsafeRun()).rejects.toThrow(
        NotFoundMyCarDomainError,
      );

      expect(mockUserRepository.getById).toBeCalledWith(mockUser.id);
      expect(mockMyCarProductRepository.getByIdOwnedByUser).toBeCalledWith(mockMyCar.id, mockUser.id);
    });

    it("should error out if user wasn't found", async () => {
      mockUserRepository.getById.mockImplementation(async () => null);
      mockMyCarProductRepository.getByIdOwnedByUser.mockImplementation(async () => ({
        ...mockMyCar,
        status: MyCarProductStatusEnum.DEACTIVE,
      }));

      await expect(usecase.upgrade(mockMyCar.id, mockUser.id, creditCardId).unsafeRun()).rejects.toThrow(
        NoUserFoundDomainError,
      );

      expect(mockUserRepository.getById).toBeCalledWith(mockUser.id);
      expect(mockMyCarProductRepository.getByIdOwnedByUser).toBeCalledWith(mockMyCar.id, mockUser.id);
    });
  });
});
