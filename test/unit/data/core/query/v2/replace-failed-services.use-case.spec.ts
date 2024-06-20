import { Test, TestingModule } from '@nestjs/testing';
import { ReplaceFailedServicesUseCase } from 'src/data/core/query/v2/replace-failed-services.use-case';
import { NoServiceFoundDomainError, QueryNotExistsError } from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ReplacedServiceCodeto, ServiceDto } from 'src/domain/_layer/data/dto/service.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { ServiceRepository } from 'src/domain/_layer/infrastructure/repository/service.repository';
import { AutoReprocessQueryService } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { ReplaceFailedServicesDomain } from 'src/domain/core/query/v2/replace-failed-services.domain';
import { mockQueryDto } from 'test/mocks/dto/query.dto.mock';
import { mockServiceDto } from 'test/mocks/dto/service.dto.mock';

describe('ReplaceFailedServicesUseCase', () => {
  let sut: ReplaceFailedServicesUseCase;
  let module: TestingModule;
  let queryRepository: QueryRepository;
  let queryRequestService: QueryRequestService;
  let serviceRepository: ServiceRepository;
  let autoReprocessQueryService: AutoReprocessQueryService;

  const service1: ServiceDto = mockServiceDto();
  const service2: ServiceDto = mockServiceDto();

  const queryDto: QueryDto = mockQueryDto();
  const queryId: string = queryDto.id;

  const replacedServices: ReadonlyArray<ReplacedServiceCodeto> = [
    {
      serviceCode: service1.code,
      newServiceCode: service2.code,
    },
  ];

  const allServices: ReadonlyArray<ServiceDto> = [service1, service2];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: ReplaceFailedServicesDomain,
          useClass: ReplaceFailedServicesUseCase,
        },
        {
          provide: QueryRequestService,
          useValue: {
            reprocessQueryByReplacedServices: jest.fn(),
          },
        },
        {
          provide: ServiceRepository,
          useValue: {
            getManyByServicesCodes: jest.fn().mockResolvedValue(allServices),
          },
        },
        {
          provide: QueryRepository,
          useValue: {
            getById: jest.fn().mockResolvedValue(queryDto),
          },
        },
        {
          provide: AutoReprocessQueryService,
          useValue: {
            cancelReprocess: jest.fn(),
          },
        },
      ],
    }).compile();

    queryRequestService = module.get(QueryRequestService);
    serviceRepository = module.get(ServiceRepository);
    queryRepository = module.get(QueryRepository);
    autoReprocessQueryService = module.get(AutoReprocessQueryService);
  });

  beforeEach(async () => {
    sut = await module.resolve(ReplaceFailedServicesDomain);
  });

  test('shoul call QueryRepository.getById with correct queryId', async () => {
    await sut.replace(queryId, replacedServices).safeRun();

    expect(queryRepository.getById).toHaveBeenCalledTimes(1);
    expect(queryRepository.getById).toHaveBeenCalledWith(queryId);
  });

  test('should throw an QueryNotExistsError if QueryRepository.getById returns null', async () => {
    jest.spyOn(queryRepository, 'getById').mockResolvedValueOnce(null);

    const promise: Promise<void> = sut.replace(queryId, replacedServices).unsafeRun();

    expect(promise).rejects.toThrow(QueryNotExistsError);
  });

  test('shoul call ServiceRepository.getManyByServicesCodes with correct queryId', async () => {
    await sut.replace(queryId, replacedServices).safeRun();

    expect(serviceRepository.getManyByServicesCodes).toHaveBeenCalledTimes(1);
    expect(serviceRepository.getManyByServicesCodes).toHaveBeenCalledWith([service2.code, service1.code]);
  });

  test('should throw an NoServiceFoundDomainError if ServiceRepository.getManyByServicesCodes a diferent value of services that are passed', async () => {
    jest.spyOn(serviceRepository, 'getManyByServicesCodes').mockResolvedValueOnce([service1]);

    const promise: Promise<void> = sut.replace(queryId, replacedServices).unsafeRun();

    expect(promise).rejects.toThrow(NoServiceFoundDomainError);
  });

  test('should call QueryRequestService.reprocessQueryByReplacedServices with correct params on success', async () => {
    await sut.replace(queryId, replacedServices).safeRun();

    expect(queryRequestService.reprocessQueryByReplacedServices).toHaveBeenCalledTimes(1);
    expect(queryRequestService.reprocessQueryByReplacedServices).toHaveBeenCalledWith({
      queryRef: queryId,
      services: [
        {
          serviceRef: service1.code?.toString(),
          newServiceRef: service2.code?.toString(),
        },
      ],
    });
  });

  test('should call cancelation reprocesss one time with queryId', async () => {
    await sut.replace(queryId, replacedServices).safeRun();

    expect(autoReprocessQueryService.cancelReprocess).toHaveBeenCalledTimes(1);
    expect(autoReprocessQueryService.cancelReprocess).toHaveBeenCalledWith(queryId);
  });
});
