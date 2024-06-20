import { Test, TestingModule } from '@nestjs/testing';
import { AutomateQueryUseCase } from 'src/data/core/query/automate-query.use-case';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { CarRevendorRepository } from 'src/domain/_layer/infrastructure/repository/car-revendor.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { AutomateService } from 'src/domain/_layer/infrastructure/service/automate.service';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';
import { AutomateQueryDomain } from 'src/domain/core/query/automate-query.domain';

describe('AutomateQueryUseCase', () => {
  let sut: AutomateQueryUseCase;
  let module: TestingModule;
  let userRepository: UserRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: AutomateQueryDomain,
          useClass: AutomateQueryUseCase,
        },
        {
          provide: AutomateService,
          useValue: {
            dispatch: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: ConsentsService,
          useValue: {
            isGivenConsent: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: CarRevendorRepository,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(AutomateQueryDomain);
  });

  beforeEach(() => {
    userRepository = module.get(UserRepository);
  });

  describe('#saveResponseQuery', () => {
    test('should call user repository one time with params', async () => {
      const userId: string = 'any_user_id';
      await sut.saveResponseQuery({ userId, queryCode: 100 } as QueryDto).safeRun();

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(userRepository.getById).toHaveBeenCalledWith(userId);
    });
  });
});
