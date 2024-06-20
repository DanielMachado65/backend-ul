import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty()
  @IsString()
  notificationId: string;

  @ApiProperty()
  @IsBoolean()
  wasSeen: boolean;
}

export class UpdateNotificationsInputDto {
  @ApiProperty({ type: [UpdateNotificationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateNotificationDto)
  notifications: ReadonlyArray<UpdateNotificationDto>;
}
