import { Test, TestingModule } from '@nestjs/testing';
import { CreditQueryRepository } from 'src/domain/_layer/infrastructure/repository/credit-query.repository';
import { PersonScoreVo } from 'src/domain/value-object/credit/person-score.vo';
import { RedisCacheManager } from 'src/infrastructure/repository/_redis/redis-cache-manager';
import { CreditQueryRedisRepository } from 'src/infrastructure/repository/query/credit-query.redis.repository';
import { mockPersonScore } from 'test/mocks/dto/credit-query.dto.mock';

describe('CreditQueryRedisRepository', () => {
  let sut: CreditQueryRedisRepository;
  let redisCacheManager: RedisCacheManager;
  let module: TestingModule;

  const queryId: string = 'any_query_id';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: CreditQueryRepository,
          useClass: CreditQueryRedisRepository,
        },
        {
          provide: RedisCacheManager,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    redisCacheManager = module.get(RedisCacheManager);
  });

  beforeEach(async () => {
    sut = await module.resolve(CreditQueryRepository);
  });

  describe('#insertScore', () => {
    const personScore: PersonScoreVo = mockPersonScore();

    test('should call RedisCacheManager.set with correct input and TTL', async () => {
      await sut.insertScore(queryId, { personScore });

      expect(redisCacheManager.set).toHaveBeenCalledTimes(1);
      expect(redisCacheManager.set).toHaveBeenCalledWith(
        'credit-query-score',
        queryId,
        { personScore },
        1_000 * 60 * 60,
      );
    });
  });

  describe('#getScore', () => {
    test('should call RedisCacheManager.get with correct context and key', async () => {
      await sut.getScore(queryId);

      expect(redisCacheManager.get).toHaveBeenCalledTimes(1);
      expect(redisCacheManager.get).toHaveBeenCalledWith('credit-query-score', queryId);
    });
  });
});
