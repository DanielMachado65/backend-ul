import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { RedisClientOptions } from 'redis';
import { RedisCacheManager } from './redis-cache-manager';
import { RedisCacheManagerMock } from './redis-cache-manager.mock';

@Module({
  imports: [CacheModule.register<RedisClientOptions>()],
  providers: [{ provide: RedisCacheManager, useClass: RedisCacheManagerMock }],
  exports: [{ provide: RedisCacheManager, useClass: RedisCacheManagerMock }],
})
export class RedisManagerMockModule {}
