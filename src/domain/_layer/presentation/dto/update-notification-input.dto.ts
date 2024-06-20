import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateNotificationInputDto {
  @ApiProperty()
  @IsBoolean()
  wasSeen: boolean;
}
