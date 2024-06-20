import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class SoftDeleteNotificationsInputDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @Type(() => String)
  notificationIds: ReadonlyArray<string>;
}
