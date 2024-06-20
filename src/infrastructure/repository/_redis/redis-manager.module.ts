import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { RedisCacheManager } from './redis-cache-manager';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        store: redisStore,

        // Store-specific configuration:
        url: envService.get('REDIS_CONNECTION_STRING'),
      }),
    }),
  ],
  providers: [RedisCacheManager],
  exports: [RedisCacheManager],
})
export class RedisManagerModule {}
