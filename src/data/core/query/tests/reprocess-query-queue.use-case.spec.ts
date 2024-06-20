/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';

import { ReprocessQueryQueueUseCase } from 'src/data/core/query/reprocess-query-queue.use-case';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { AutoReprocessQueryService } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';
import { FeatureFlagPerRequestService } from 'src/domain/_layer/infrastructure/service/feature-flag-per-request.service';
import { NotificationServiceGen } from 'src/domain/_layer/infrastructure/service/notification';
import { ReprocessQueryQueueDomain } from 'src/domain/core/query/reprocess-query-queue.domain';

describe('ReprocessQueryQueueUseCase', () => {
  let sut: ReprocessQueryQueueUseCase;
  let module: TestingModule;
  let queryRepository: QueryRepository;

  const queryId: string = 'any_query_id';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: ReprocessQueryQueueDomain,
          useClass: ReprocessQueryQueueUseCase,
        },
        {
          provide: QueryRepository,
          useValue: {
            getById: jest.fn(),
            updateById: jest.fn(),
          },
        },
        {
          provide: AutoReprocessQueryService,
          useValue: {
            requestToReprocess: jest.fn(),
          },
        },
        {
          provide: FeatureFlagPerRequestService,
          useValue: {
            get: jest.fn(),
            setAttributes: jest.fn(),
          },
        },
        {
          provide: NotificationServiceGen,
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
      ],
    }).compile();

    sut = await module.resolve(ReprocessQueryQueueDomain);
  });

  beforeEach(() => {
    queryRepository = module.get(QueryRepository);
  });

  describe('#saveLegacyQuery', () => {
    test('should call getById one time with queryId', () => {
      sut.saveLegacyQuery(queryId, { services: [], vehicle: {}, status: 'SUCCESS' }).safeRun();

      expect(queryRepository.getById).toHaveBeenCalledTimes(1);
      expect(queryRepository.getById).toHaveBeenCalledWith(queryId);
    });
  });
});
