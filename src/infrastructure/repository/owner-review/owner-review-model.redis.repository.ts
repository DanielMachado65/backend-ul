import { Injectable } from '@nestjs/common';
import {
  OwnerReviewModel,
  OwnerReviewModelRepository,
} from 'src/domain/_layer/infrastructure/repository/owner-review-model.repository';
import { RedisCacheManager } from '../_redis/redis-cache-manager';

@Injectable()
export class OwnerReviewModelRedisRepository implements OwnerReviewModelRepository {
  constructor(private readonly _redisCacheManager: RedisCacheManager) {}

  async insertModel(
    fipeId: string | number,
    modelYear: number,
    queryResult: OwnerReviewModel,
  ): Promise<OwnerReviewModel> {
    await this._redisCacheManager.set(
      'owner-review-vehicle',
      this._buildKey(fipeId, modelYear),
      queryResult,
      1_000 * 60 * 60 * 24 * 30,
    );
    return queryResult;
  }

  async getModel(fipeId: string | number, modelYear: number): Promise<OwnerReviewModel | null> {
    const result: OwnerReviewModel | undefined = await this._redisCacheManager.get(
      'owner-review-vehicle',
      this._buildKey(fipeId, modelYear),
    );
    return result || null;
  }

  private _buildKey(fipeId: string | number, modelYear: number): string {
    return `${fipeId}:${modelYear}`;
  }
}
