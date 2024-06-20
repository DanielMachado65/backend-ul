import { Module, Provider } from '@nestjs/common';

import { GetNotificationsDomain } from 'src/domain/support/notification/get-notifications.domain';
import { RegisterAppTokenDomain } from 'src/domain/support/notification/register-app-token.domain';
import { SoftDeleteNotificationsDomain } from 'src/domain/support/notification/soft-delete-notifications.domain';
import { UpdateNotificationsDomain } from 'src/domain/support/notification/update-notifications.domain';
import { GetNotificationsUseCase } from './get-notifications.use-case';
import { RegisterAppTokenUseCase } from './register-app-token.use-case';
import { SoftDeleteNotificationsUseCase } from './soft-delete-notifications.use-case';
import { UpdateNotificationsUseCase } from './update-notifications.use-case';

const useCases: ReadonlyArray<Provider> = [
  { provide: GetNotificationsDomain, useClass: GetNotificationsUseCase },
  { provide: RegisterAppTokenDomain, useClass: RegisterAppTokenUseCase },
  { provide: SoftDeleteNotificationsDomain, useClass: SoftDeleteNotificationsUseCase },
  { provide: UpdateNotificationsDomain, useClass: UpdateNotificationsUseCase },
];

@Module({
  imports: [],
  controllers: [],
  providers: [...useCases],
  exports: [...useCases],
})
export class NotificationDataLayerModule {}
