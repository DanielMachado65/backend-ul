import { Injectable } from '@nestjs/common';
import { CreditScoreEntity } from 'src/domain/_entity/credit-score.entity';
import { CreditQueryRepository } from 'src/domain/_layer/infrastructure/repository/credit-query.repository';
import { RedisCacheManager } from 'src/infrastructure/repository/_redis/redis-cache-manager';

@Injectable()
export class CreditQueryRedisRepository implements CreditQueryRepository {
  constructor(private readonly _redisCacheManager: RedisCacheManager) {}

  async insertScore(queryId: string, queryResult: CreditScoreEntity): Promise<void> {
    const minutes: number = 1_000 * 60 * 60; // 1 hora
    await this._redisCacheManager.set('credit-query-score', queryId, queryResult, minutes);
  }

  async getScore(queryId: string): Promise<CreditScoreEntity | null> {
    const result: CreditScoreEntity | undefined = await this._redisCacheManager.get('credit-query-score', queryId);
    return result || null;
  }
}
