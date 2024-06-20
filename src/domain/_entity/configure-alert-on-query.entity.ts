import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';
import { NotificationChannel } from './notification.entity';

export abstract class ConfigureAlertOnQueryEntity {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ enum: NotificationChannel, isArray: true })
  @IsEnum(NotificationChannel, { each: true })
  notificationChannels: ReadonlyArray<NotificationChannel>;
}
