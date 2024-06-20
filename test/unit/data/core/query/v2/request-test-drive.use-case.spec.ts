import { Test, TestingModule } from '@nestjs/testing';
import { RequestTestDriveUseCase } from 'src/data/core/query/v2/request-test-drive.use-case';
import { QueryComposeStatus } from 'src/domain/_entity/query-composer.entity';
import { BlacklistKeysDomainError, QueryCannotBeRequestedDomainError } from 'src/domain/_entity/result.error';
import { TestDriveQueryDocumentType, TestDriveQueryStatus } from 'src/domain/_entity/test-drive-query.entity';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { CityZipCodeRepository } from 'src/domain/_layer/infrastructure/repository/city-zipcode.repository';
import { QueryComposerRepository } from 'src/domain/_layer/infrastructure/repository/query-composer.repository';
import { TestDriveQueryRepository } from 'src/domain/_layer/infrastructure/repository/test-drive-query.repository';
import { BlogService } from 'src/domain/_layer/infrastructure/service/blog.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { VideoPlatformService } from 'src/domain/_layer/infrastructure/service/video-platform.service';
import {
  RequestTestDriveDomain,
  RequestTestDriveDomainErrors,
  RequestTestDriveResult,
} from 'src/domain/core/query/v2/request-test-drive.domain';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

describe('RequestTestDriveUseCase', () => {
  let sut: RequestTestDriveUseCase;
  let module: TestingModule;
  let queryComposerRepository: QueryComposerRepository;
  let cityZipCodeRepository: CityZipCodeRepository;
  let testDriveQueryRepository: TestDriveQueryRepository;

  const userCity: string = 'São Paulo';
  const ip: string = 'any_ip';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: RequestTestDriveDomain,
          useClass: RequestTestDriveUseCase,
        },
        {
          provide: QueryComposerRepository,
          useValue: {
            getByQueryCode: jest.fn().mockReturnValue({
              canBeTestDrive: true,
              status: QueryComposeStatus.ACTIVATED,
              serviceIds: ['service_1', 'service_2'],
              queryCode: 1000,
              name: 'Test Drive',
            }),
          },
        },
        {
          provide: CityZipCodeRepository,
          useValue: {
            findZipCodeByCityName: jest.fn(),
          },
        },
        {
          provide: TestDriveQueryRepository,
          useValue: {
            getById: jest.fn().mockResolvedValue({
              queryStatus: TestDriveQueryStatus.SUCCESS,
              responseJson: {
                chassi: 'any_chassi',
                renavam: 'any_renavam',
                numMotor: 'any_num_motor',
              },
            }),
            updateById: jest.fn(),
            insert: jest.fn(),
          },
        },
        {
          provide: QueryRequestService,
          useValue: {
            requestQuery: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: VideoPlatformService,
          useValue: {
            getEmbedInfo: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: DateTimeUtil,
          useValue: {
            fromIso: jest.fn(),
            now: jest.fn().mockReturnValue({ diff: jest.fn() }),
          },
        },
        {
          provide: BlogService,
          useValue: {
            fetchPostData: jest.fn().mockReturnValue([]),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(RequestTestDriveDomain);
  });

  beforeEach(() => {
    queryComposerRepository = module.get(QueryComposerRepository);
    cityZipCodeRepository = module.get(CityZipCodeRepository);
    testDriveQueryRepository = module.get(TestDriveQueryRepository);
  });

  describe('#requestTestDrive', () => {
    test('should validate return BlacklistKeysDomainError if plate is invalid', async () => {
      const error: BlacklistKeysDomainError = new BlacklistKeysDomainError();
      const response: RequestTestDriveResult = await sut
        .requestTestDrive({ plate: 'AYB0731' }, ip, null, userCity)
        .safeRun();

      const result: RequestTestDriveDomainErrors = response.getLeft();
      expect(result).toEqual(error);
    });

    test('should validate return BlacklistKeysDomainError if chassis is invalid', async () => {
      const error: BlacklistKeysDomainError = new BlacklistKeysDomainError();
      const response: RequestTestDriveResult = await sut
        .requestTestDrive({ chassis: '93Y4SRD64EJ830469' }, ip, null, userCity)
        .safeRun();

      const result: RequestTestDriveDomainErrors = response.getLeft();
      expect(result).toEqual(error);
    });

    test('should call getByQueryCode one time with code 1000', async () => {
      await sut.requestTestDrive({ plate: 'ABC1234' }, ip, null, userCity).safeRun();

      expect(queryComposerRepository.getByQueryCode).toHaveBeenCalledTimes(1);
      expect(queryComposerRepository.getByQueryCode).toHaveBeenCalledWith(1000);
    });

    test('should return QueryCannotBeRequestedDomainError if template is disable', async () => {
      const error: QueryCannotBeRequestedDomainError = new QueryCannotBeRequestedDomainError();

      jest
        .spyOn(queryComposerRepository, 'getByQueryCode')
        .mockResolvedValueOnce({ canBeTestDrive: true, status: QueryComposeStatus.DISABLED } as QueryComposerDto);

      const response: RequestTestDriveResult = await sut
        .requestTestDrive({ plate: 'ABC1234' }, ip, null, userCity)
        .safeRun();

      const result: RequestTestDriveDomainErrors = response.getLeft();

      expect(result).toEqual(error);
    });

    test('should return QueryCannotBeRequestedDomainError if canBeTestDrive is false', async () => {
      const error: QueryCannotBeRequestedDomainError = new QueryCannotBeRequestedDomainError();

      jest
        .spyOn(queryComposerRepository, 'getByQueryCode')
        .mockResolvedValueOnce({ canBeTestDrive: false, status: QueryComposeStatus.ACTIVATED } as QueryComposerDto);

      const response: RequestTestDriveResult = await sut
        .requestTestDrive({ plate: 'ABC1234' }, ip, null, userCity)
        .safeRun();

      const result: RequestTestDriveDomainErrors = response.getLeft();

      expect(result).toEqual(error);
    });

    test('should return QueryCannotBeRequestedDomainError if serviceIds is empty', async () => {
      const error: QueryCannotBeRequestedDomainError = new QueryCannotBeRequestedDomainError();

      jest.spyOn(queryComposerRepository, 'getByQueryCode').mockResolvedValueOnce({
        canBeTestDrive: true,
        status: QueryComposeStatus.ACTIVATED,
        serviceIds: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const response: RequestTestDriveResult = await sut
        .requestTestDrive({ plate: 'ABC1234' }, ip, null, userCity)
        .safeRun();

      const result: RequestTestDriveDomainErrors = response.getLeft();

      expect(result).toEqual(error);
    });

    test('should call findZipCodeByCityName one time with city name', async () => {
      await sut.requestTestDrive({ plate: 'ABC1234' }, ip, null, userCity).safeRun();

      expect(cityZipCodeRepository.findZipCodeByCityName).toHaveBeenCalledTimes(1);
      expect(cityZipCodeRepository.findZipCodeByCityName).toHaveBeenCalledWith(userCity);
    });

    test('should call insert one time with params', async () => {
      await sut.requestTestDrive({ plate: 'ABC1234' }, ip, null, userCity).safeRun();

      expect(testDriveQueryRepository.insert).toHaveBeenCalledTimes(1);
      expect(testDriveQueryRepository.insert).toHaveBeenCalledWith({
        queryKeys: {
          plate: 'ABC1234',
        },
        queryCode: 1000,
        executionTime: 0,
        control: {
          requestIp: ip,
        },
        userId: null,
        refClass: 'Test Drive',
        documentType: TestDriveQueryDocumentType.PLATE,
        documentQuery: 'ABC1234',
      });
    });
  });
});
