import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { GetPlanAvailabilityUseCase } from 'src/data/core/product/get-plan-availability.use-case';
import { PlanAvailabilityHelper } from 'src/data/core/product/plan-availability.helper';
import { PlanIntervalFrequency, PlanStatus } from 'src/domain/_entity/plan.entity';
import { NoPlanFoundDomainError } from 'src/domain/_entity/result.error';
import { PlanDto } from 'src/domain/_layer/data/dto/plan.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { PlanRepository } from 'src/domain/_layer/infrastructure/repository/plan.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PlanAvailabilityOutputDto } from 'src/domain/_layer/presentation/dto/plan-availability-output.dto';
import { GetPlanAvailabilityDomain } from 'src/domain/core/product/get-plan-availability.domain';
import { EnvMockService } from 'src/infrastructure/framework/env.mock.service';
import { EnvService } from 'src/infrastructure/framework/env.service';

describe('GetPlanAvailabilityUseCase', () => {
  let sut: GetPlanAvailabilityDomain;
  let module: TestingModule;
  let myCarProductRepository: MyCarProductRepository;
  let planRepository: PlanRepository;
  let userRepository: UserRepository;

  const userId: string = 'any_user_id';

  const userMock: Partial<UserDto> = {
    id: userId,
    email: 'user@email.com',
  };

  const planMock: Partial<PlanDto> = {
    costInCents: 123,
    createdAt: new Date().toISOString(),
    description: 'any_description',
    id: 'any_id',
    intervalFrequency: PlanIntervalFrequency.MONTHS,
    intervalValue: 1,
    name: 'any_name',
    status: PlanStatus.ACTIVE,
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ConfigService,
        PlanAvailabilityHelper,
        {
          provide: EnvService,
          useClass: EnvMockService,
        },
        {
          provide: GetPlanAvailabilityDomain,
          useClass: GetPlanAvailabilityUseCase,
        },
        {
          provide: MyCarProductRepository,
          useValue: {
            countByUserId: jest.fn(),
          },
        },
        {
          provide: PlanRepository,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    myCarProductRepository = module.get(MyCarProductRepository);
    planRepository = module.get(PlanRepository);
    userRepository = module.get(UserRepository);

    sut = await module.resolve(GetPlanAvailabilityDomain);
  });

  describe('#getPlanAvailability', () => {
    test('non existing or different plan should raise NoPlanFoundDomainError', async () => {
      jest.spyOn(myCarProductRepository, 'countByUserId').mockResolvedValueOnce(0);
      jest.spyOn(planRepository, 'getById').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce(userMock as UserDto);

      const promise: Promise<PlanAvailabilityOutputDto> = sut.getPlanAvailability(userId).unsafeRun();

      await expect(promise).rejects.toThrow(NoPlanFoundDomainError);
    });

    test('if no user then should flag one free subscription', async () => {
      jest.spyOn(myCarProductRepository, 'countByUserId').mockResolvedValueOnce(0);
      jest.spyOn(planRepository, 'getById').mockResolvedValueOnce(planMock as PlanDto);
      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce(null);

      const promise: Promise<PlanAvailabilityOutputDto> = sut.getPlanAvailability(userId).unsafeRun();

      await expect(promise).resolves.toEqual({
        isFreePlanAvailableToBeCreated: true,
        plan: { ...planMock },
      });
    });

    test('if user has no vehicles then should flag one free subscription', async () => {
      jest.spyOn(myCarProductRepository, 'countByUserId').mockResolvedValueOnce(0);
      jest.spyOn(planRepository, 'getById').mockResolvedValueOnce(planMock as PlanDto);
      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce(userMock as UserDto);

      const promise: Promise<PlanAvailabilityOutputDto> = sut.getPlanAvailability(userId).unsafeRun();

      await expect(promise).resolves.toEqual({
        isFreePlanAvailableToBeCreated: true,
        plan: { ...planMock },
      });
    });

    test('if user has one vehicle then should flag no free subscription', async () => {
      jest.spyOn(myCarProductRepository, 'countByUserId').mockResolvedValueOnce(1);
      jest.spyOn(planRepository, 'getById').mockResolvedValueOnce(planMock as PlanDto);
      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce(userMock as UserDto);

      const promise: Promise<PlanAvailabilityOutputDto> = sut.getPlanAvailability(userId).unsafeRun();

      await expect(promise).resolves.toEqual({
        isFreePlanAvailableToBeCreated: false,
        plan: { ...planMock },
      });
    });

    test('if user has multiple vehicles then should flag no free subscription', async () => {
      jest.spyOn(myCarProductRepository, 'countByUserId').mockResolvedValueOnce(5);
      jest.spyOn(planRepository, 'getById').mockResolvedValueOnce(planMock as PlanDto);
      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce(userMock as UserDto);

      const promise: Promise<PlanAvailabilityOutputDto> = sut.getPlanAvailability(userId).unsafeRun();

      await expect(promise).resolves.toEqual({
        isFreePlanAvailableToBeCreated: false,
        plan: { ...planMock },
      });
    });
  });
});
