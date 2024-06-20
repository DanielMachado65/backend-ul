import { Injectable } from '@nestjs/common';
import {
  OwnerReviewModel,
  OwnerReviewModelRepository,
} from 'src/domain/_layer/infrastructure/repository/owner-review-model.repository';
import { RedisCacheManagerMock } from '../_redis/redis-cache-manager.mock';

@Injectable()
export class OwnerReviewModelMemoryRepository implements OwnerReviewModelRepository {
  constructor(private readonly _redisCacheManagerMock: RedisCacheManagerMock) {}

  async insertModel(
    codModel: string | number,
    modelYear: number,
    queryResult: OwnerReviewModel,
  ): Promise<OwnerReviewModel> {
    await this._redisCacheManagerMock.set(
      'owner-review-vehicle',
      this._buildKey(codModel, modelYear),
      queryResult,
      1_000 * 60 * 60 * 24 * 30,
    );
    return queryResult;
  }

  async getModel(codModel: string | number, modelYear: number): Promise<OwnerReviewModel | null> {
    const result: OwnerReviewModel | undefined = await this._redisCacheManagerMock.get(
      'owner-review-vehicle',
      this._buildKey(codModel, modelYear),
    );
    return result || null;
  }

  private _buildKey(codModel: string | number, modelYear: number): string {
    return `${codModel}:${modelYear}`;
  }
}
