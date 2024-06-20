import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCountTestDriveUseCase } from 'src/data/core/query/v2/update-count-test-drive.use-case';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TotalTestDriveDto } from 'src/domain/_layer/data/dto/total-test-drive.dto';
import { TestDriveQueryRepository } from 'src/domain/_layer/infrastructure/repository/test-drive-query.repository';
import { TotalTestDriveRepository } from 'src/domain/_layer/infrastructure/repository/total-test-drive.repository';
import {
  UpdateCountTestDriveDomain,
  UpdateCountTestDriveResult,
} from 'src/domain/core/query/v2/update-count-test-drive.domain';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

describe('UpdateCountTestDriveUseCase', () => {
  let sut: UpdateCountTestDriveUseCase;
  let module: TestingModule;
  let envService: EnvService;
  let totalTestDriveRepository: TotalTestDriveRepository;
  let testDriveQueryRepository: TestDriveQueryRepository;

  const response: TotalTestDriveDto = {
    total: 0,
    createdAt: new Date(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: UpdateCountTestDriveDomain,
          useClass: UpdateCountTestDriveUseCase,
        },
        {
          provide: TestDriveQueryRepository,
          useValue: {
            countByDay: jest.fn().mockResolvedValue(response),
          },
        },
        {
          provide: TotalTestDriveRepository,
          useValue: {
            getCurrent: jest.fn().mockResolvedValue(response),
            insert: jest.fn(),
          },
        },
        {
          provide: EnvService,
          useValue: {
            get: jest.fn().mockReturnValue('valid_token'),
          },
        },
        DateTimeUtil,
      ],
    }).compile();

    sut = await module.resolve(UpdateCountTestDriveDomain);
  });

  beforeEach(() => {
    envService = module.get(EnvService);
    totalTestDriveRepository = module.get(TotalTestDriveRepository);
    testDriveQueryRepository = module.get(TestDriveQueryRepository);
  });

  describe('#execute', () => {
    test('should send an invalid token and should return UnknownDomainError', async () => {
      const error: UnknownDomainError = new UnknownDomainError();
      const result: UpdateCountTestDriveResult = await sut.execute('invalid_token').safeRun();

      expect(result.isLeft()).toEqual(true);
      expect(result.getLeft()).toEqual(error);
    });

    test('should call get of envService one time with', async () => {
      await sut.execute('valid_token').safeRun();

      expect(envService.get).toHaveBeenCalledTimes(1);
      expect(envService.get).toHaveBeenCalledWith('SCHEDULER_TOKEN');
    });

    test('should call getCurrent one time', async () => {
      await sut.execute('valid_token').safeRun();

      expect(totalTestDriveRepository.getCurrent).toHaveBeenCalledTimes(1);
      expect(totalTestDriveRepository.getCurrent).toHaveBeenCalledWith();
    });

    test('should not call countByDay and insert if has an update today', async () => {
      await sut.execute('valid_token').safeRun();

      expect(totalTestDriveRepository.insert).toHaveBeenCalledTimes(0);
      expect(testDriveQueryRepository.countByDay).toHaveBeenCalledTimes(0);
    });

    test('should not update and retrun the same existenting value', async () => {
      const mokedData: TotalTestDriveDto = {
        total: 1000,
        createdAt: new Date(),
      };
      jest.spyOn(totalTestDriveRepository, 'getCurrent').mockResolvedValueOnce(mokedData);

      const result: UpdateCountTestDriveResult = await sut.execute('valid_token').safeRun();

      expect(result.getRight()).toEqual(mokedData);
    });
  });
});
