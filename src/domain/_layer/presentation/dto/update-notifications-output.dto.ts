import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { UpdateNotificationOutputDto } from './update-notification-output.dto';

export class UpdateNotificationsOutputDto {
  @ApiProperty({ type: [UpdateNotificationOutputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateNotificationOutputDto)
  notifications: ReadonlyArray<UpdateNotificationOutputDto>;
}
