import { Test, TestingModule } from '@nestjs/testing';
import { ResquestAutoReprocessQueryUseCase } from 'src/data/core/query/request-auto-reprocess-query.use-case';
import { QueryNotExistsError, QueryOwnerInvalid } from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { AutoReprocessQueryService } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';
import {
  ResquestAutoReprocessQueryDomain,
  ResquestAutoReprocessQueryResult,
} from 'src/domain/core/query/request-auto-reprocess-query.domain';

describe('ResquestAutoReprocessQueryUseCase', () => {
  let sut: ResquestAutoReprocessQueryUseCase;
  let module: TestingModule;
  let queryRepository: QueryRepository;

  const queryId: string = 'any_query_id';
  const userId: string = 'any_user_id';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: ResquestAutoReprocessQueryDomain,
          useClass: ResquestAutoReprocessQueryUseCase,
        },
        {
          provide: QueryRepository,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: AutoReprocessQueryService,
          useValue: {
            requestToReprocess: jest.fn(),
          },
        },
      ],
    }).compile();

    queryRepository = module.get(QueryRepository);
  });

  beforeEach(async () => {
    sut = await module.resolve(ResquestAutoReprocessQueryDomain);
  });

  describe('#requestByQueryId', () => {
    test('should return QueryNotExistsError', async () => {
      jest.spyOn(queryRepository, 'getById').mockResolvedValueOnce(null);

      const result: ResquestAutoReprocessQueryResult = await sut.requestByQueryId(userId, queryId).safeRun();

      expect(result.isLeft()).toStrictEqual(true);
      expect(result.getLeft()).toEqual(new QueryNotExistsError());
    });

    test('should return QueryOwnerInvalid', async () => {
      jest.spyOn(queryRepository, 'getById').mockResolvedValueOnce({ userId: 'err' } as QueryDto);

      const result: ResquestAutoReprocessQueryResult = await sut.requestByQueryId(userId, queryId).safeRun();

      expect(result.isLeft()).toStrictEqual(true);
      expect(result.getLeft()).toEqual(new QueryOwnerInvalid());
    });
  });
});
