import { Test, TestingModule } from '@nestjs/testing';
import { GetTotalTestsDrivesUseCase } from 'src/data/core/query/v2/get-total-tests-drives.use-case';
import { TotalTestDriveRepository } from 'src/domain/_layer/infrastructure/repository/total-test-drive.repository';
import { GetTotalTestsDrivesDomain } from 'src/domain/core/query/v2/get-total-tests-drives.domain';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

describe('GetTotalTestsDrivesUseCase', () => {
  let sut: GetTotalTestsDrivesUseCase;
  let module: TestingModule;
  let totalTestDriveRepository: TotalTestDriveRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: GetTotalTestsDrivesDomain,
          useClass: GetTotalTestsDrivesUseCase,
        },
        {
          provide: TotalTestDriveRepository,
          useValue: {
            getCurrent: jest.fn(),
          },
        },
        {
          provide: DateTimeUtil,
          useClass: DateTimeUtil,
        },
      ],
    }).compile();

    sut = await module.resolve(GetTotalTestsDrivesDomain);
  });

  beforeEach(() => {
    totalTestDriveRepository = module.get(TotalTestDriveRepository);
  });

  describe('#execute', () => {
    test('should call getCurrent one time if cache is null', async () => {
      await sut.execute().safeRun();

      expect(totalTestDriveRepository.getCurrent).toHaveBeenCalledTimes(1);
      expect(totalTestDriveRepository.getCurrent).toHaveBeenCalledWith();
    });
  });
});
