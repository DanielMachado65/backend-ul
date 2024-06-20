import { HttpModule } from '@nestjs/axios';
import { Global, Module, Provider } from '@nestjs/common';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { NovuAdapter } from 'src/infrastructure/notification/novu-adapter';
import { ENV_KEYS, EnvService } from '../framework/env.service';

const providers: ReadonlyArray<Provider> = [
  {
    provide: NotificationInfrastructure,
    useClass: NovuAdapter,
  },
];

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        timeout: envService.get(ENV_KEYS.HTTP_TIMEOUT),
      }),
    }),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class NotificationModule {}
