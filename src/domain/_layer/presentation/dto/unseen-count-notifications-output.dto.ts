import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class UnseenCountNotificationsOutputDto {
  @ApiProperty({ type: Number })
  @IsArray()
  @Type(() => Number)
  total: number;
}
