import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { SoftDeleteNotificationOutputDto } from './soft-delete-notification-output.dto';

export class SoftDeleteNotificationsOutputDto {
  @ApiProperty({ type: [SoftDeleteNotificationOutputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SoftDeleteNotificationOutputDto)
  notifications: ReadonlyArray<SoftDeleteNotificationOutputDto>;
}
