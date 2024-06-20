/* eslint-disable functional/prefer-readonly-type */
import { Global, MiddlewareConsumer, Module, NestModule, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { SentryModule } from '@ntegral/nestjs-sentry';
import * as mongoose from 'mongoose';
import { ClsMiddleware, ClsModule } from 'nestjs-cls';
import { JobInfrastructureModule } from 'src/infrastructure/job/job.module';
import { MessagingModule } from 'src/infrastructure/messaging/messaging.module';
import { NotificationModule } from 'src/infrastructure/notification/notification.module';
import { DomainFilter } from './filter/domain.filter';
import { ENV_KEYS, EnvService, envSchema } from './framework/env.service';
import { DynamicThrottlerGuard } from './guard/dynamic-throttler.guard';
import { RolesGuard } from './guard/roles.guard';
import { EitherTransformInterceptor } from './interceptor/either-transform.interceptor';
import { ApiInfoMiddleware } from './middleware/api-info.middleware';
import { DeviceInfoMiddleware } from './middleware/device-info.middleware';
import { HttpLogMiddleware } from './middleware/http-log.middleware';
import { UserInfoMiddleware } from './middleware/user-info.middleware';
import { ValidationPipe } from './pipe/validation.pipe';
import { RepositoryModule } from './repository/repository.module';
import { ServiceModule } from './service/service.module';
import { rastruModule } from './tracing/trace.definition';
import { UtilModule } from './util/util.module';

const internalProviders: ReadonlyArray<Provider> = [
  RolesGuard,
  ValidationPipe,
  { provide: APP_INTERCEPTOR, useClass: EitherTransformInterceptor },
  { provide: APP_FILTER, useClass: DomainFilter },
  { provide: APP_GUARD, useClass: DynamicThrottlerGuard },
  { provide: APP_GUARD, useExisting: RolesGuard },
  { provide: APP_PIPE, useExisting: ValidationPipe },
];

@Global()
@Module({
  imports: [
    ClsModule.forRootAsync({
      global: true,
      useFactory: () => ({
        middleware: {
          mount: false,
          generateId: true,
          idGenerator: (req: Request): string => {
            let requestId: string = req.headers['x-request-id'] as string;

            if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
              requestId = new mongoose.Types.ObjectId().toString();
              req.headers['x-request-id'] = requestId;
            }

            return requestId;
          },
        },
      }),
    }),
    UtilModule,
    RepositoryModule,
    ServiceModule,
    MessagingModule,
    NotificationModule,
    JobInfrastructureModule,
    SentryModule.forRootAsync({
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        dsn: envService.get(ENV_KEYS.SENTRY_DSN),
        environment: envService.isProdEnv() ? 'production' : 'homolog',
        enabled: envService.isProdEnv() || envService.isHomologEnv(),
      }),
    }),
    ConfigModule.forRoot({
      validationSchema: envSchema,
    }),
    RepositoryModule,
    ThrottlerModule.forRootAsync({
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        ttl: envService.get(ENV_KEYS.THROTTLE_TTL),
        limit: envService.get(ENV_KEYS.THROTTLE_LIMIT),
      }),
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    rastruModule,
  ],
  providers: [...internalProviders],
  exports: [],
})
export class InfrastructureLayerModule implements NestModule {
  async configure(consumer: MiddlewareConsumer): Promise<void> {
    consumer
      .apply(ClsMiddleware, HttpLogMiddleware, UserInfoMiddleware, ApiInfoMiddleware, DeviceInfoMiddleware)
      .forRoutes('*');
  }
}
