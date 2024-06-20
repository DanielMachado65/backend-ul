import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache, Milliseconds } from 'cache-manager';
import { EnvService } from 'src/infrastructure/framework/env.service';

type AvailableContexts = 'owner-review-vehicle' | 'credit-query-score';

/**
 * Wrapper for cache manager with redis storage
 */
@Injectable()
export class RedisCacheManager {
  constructor(@Inject(CACHE_MANAGER) private readonly _cacheManager: Cache, private readonly _envService: EnvService) {}

  /** Sets a value into REDIS with the context and key
   *
   * TTL can be specified, in miliseconds
   */
  set(context: AvailableContexts, key: string, value: unknown, ttl?: Milliseconds): Promise<void> {
    return this._cacheManager.set(this._buildKey(context, key), value, ttl);
  }

  /** Get a value from REDIS with the context and key */
  get<Type>(context: AvailableContexts, key: string): Promise<Type | undefined> {
    return this._cacheManager.get<Type>(this._buildKey(context, key));
  }

  /** Deletes a value from REDIS with the context and key */
  del(context: AvailableContexts, key: string): Promise<void> {
    return this._cacheManager.del(this._buildKey(context, key));
  }

  /** Builds the actual key to be used in REDIS */
  private _buildKey(context: AvailableContexts, key: string): string {
    return `uluru-${this._envService.get('NODE_ENV')}-${context}:${key}`;
  }
}
