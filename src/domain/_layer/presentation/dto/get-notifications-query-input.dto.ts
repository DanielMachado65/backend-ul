import { IsEnum, IsOptional } from 'class-validator';
import { NotificationChannel } from 'src/domain/_entity/notification.entity';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export class GetNotificationsQueryInputDto {
  @EnumUtil.ApiPropertyOptional(NotificationChannel)
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;
}
