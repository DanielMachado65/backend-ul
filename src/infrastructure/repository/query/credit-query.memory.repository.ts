import { Injectable } from '@nestjs/common';
import { CreditScoreEntity } from 'src/domain/_entity/credit-score.entity';
import { CreditQueryRepository } from 'src/domain/_layer/infrastructure/repository/credit-query.repository';
import { RedisCacheManagerMock } from '../_redis/redis-cache-manager.mock';

@Injectable()
export class CreditQueryMemoryRepository implements CreditQueryRepository {
  constructor(private readonly _redisCacheManagerMock: RedisCacheManagerMock) {}

  async insertScore(queryId: string, queryResult: CreditScoreEntity): Promise<void> {
    await this._redisCacheManagerMock.set('credit-query-score', queryId, queryResult, 1_000 * 60 * 60 * 24 * 30);
  }

  async getScore(queryId: string): Promise<CreditScoreEntity | null> {
    const result: CreditScoreEntity | undefined = await this._redisCacheManagerMock.get('credit-query-score', queryId);
    return result || null;
  }
}
