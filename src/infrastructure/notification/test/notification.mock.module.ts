import { Module, Provider } from '@nestjs/common';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { NovuAdapterMock } from 'src/infrastructure/notification/test/novu-adapter.mock';

const providers: ReadonlyArray<Provider> = [
  {
    provide: NotificationInfrastructure,
    useClass: NovuAdapterMock,
  },
];

@Module({
  imports: [],
  providers: [...providers],
  exports: [...providers],
})
export class NotificationMockModule {}
