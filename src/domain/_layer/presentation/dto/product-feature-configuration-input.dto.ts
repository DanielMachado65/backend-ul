import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { NotificationChannel } from 'src/domain/_entity/notification.entity';

export class RevisionAlertNotificationConfiguration {
  @IsBoolean()
  @ApiProperty()
  shouldNotify7DaysBefore: boolean;

  @IsBoolean()
  @ApiProperty()
  shouldNotify15DaysBefore: boolean;

  @IsBoolean()
  @ApiProperty()
  shouldNotify30DaysBefore: boolean;
}

export class RevisionAlertVehicle {
  @ApiProperty()
  @IsPositive()
  @IsNumber()
  mileageKm: number;

  @ApiProperty()
  @IsPositive()
  @IsNumber()
  mileageKmMonthly: number;
}

export class RevisionAlertConfigurationInputDto {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ type: RevisionAlertVehicle })
  @Type(() => RevisionAlertVehicle)
  vehicle: RevisionAlertVehicle;

  @ApiProperty({ enum: NotificationChannel, enumName: 'NotificationChannel', isArray: true })
  @IsEnum(NotificationChannel, { each: true })
  notificationChannels: ReadonlyArray<NotificationChannel>;

  @ApiProperty({ type: RevisionAlertNotificationConfiguration })
  @Type(() => RevisionAlertNotificationConfiguration)
  notificationConfig: RevisionAlertNotificationConfiguration;
}

export class FineAlertConfigurationInputDto {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ enum: NotificationChannel, enumName: 'NotificationChannel', isArray: true })
  @IsEnum(NotificationChannel, { each: true })
  notificationChannels: ReadonlyArray<NotificationChannel>;
}

export class PriceFIPEAlertConfigurationInputDto {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ enum: NotificationChannel, enumName: 'NotificationChannel', isArray: true })
  @IsEnum(NotificationChannel, { each: true })
  notificationChannels: ReadonlyArray<NotificationChannel>;
}

export class OnQueryAlertConfigurationInputDto {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ enum: NotificationChannel, enumName: 'NotificationChannel', isArray: true })
  @IsEnum(NotificationChannel, { each: true })
  notificationChannels: ReadonlyArray<NotificationChannel>;
}
