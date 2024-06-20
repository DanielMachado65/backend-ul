import { Module } from '@nestjs/common';
import { NotificationDataLayerModule } from '../../../data/support/notification/notification-data-layer.module';
import { NotificationController } from './notification.controller';

@Module({
  imports: [NotificationDataLayerModule],
  controllers: [NotificationController],
  providers: [],
})
export class NotificationPresentationLayerModule {}
