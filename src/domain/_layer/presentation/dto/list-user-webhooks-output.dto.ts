import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class ListUserWebhooksOutputDto {
  @ApiProperty()
  @IsArray()
  @Type(() => String)
  webhookUrls: string[];
}
