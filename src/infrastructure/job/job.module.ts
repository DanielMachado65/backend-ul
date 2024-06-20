import { Global, Module, Provider } from '@nestjs/common';

import { BullModule } from '@nestjs/bullmq';
import { JobQueue, QueryJob } from 'src/domain/_layer/infrastructure/job/query.job';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { BullAdapter } from 'src/infrastructure/job/bull-adapter';
import type { RedisOptions } from 'ioredis';

const providers: ReadonlyArray<Provider> = [
  {
    provide: QueryJob,
    useClass: BullAdapter,
  },
];

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        const url: URL = new URL(envService.get('REDIS_CONNECTION_STRING'));

        const options: RedisOptions = {};

        if (url.hostname) options.host = url.hostname;
        if (url.port) options.port = parseInt(url.port);
        if (url.username) options.username = url.username;
        if (url.password) options.password = url.password;
        if (url.pathname.length > 1) options.db = parseInt(url.pathname.slice(1));

        return {
          prefix: `uluru-${envService.get('NODE_ENV')}`,
          connection: {
            ...options,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: JobQueue.QUERY,
    }),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class JobInfrastructureModule {}
