import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class CreateUserWebhookInputDto {
  @ApiProperty()
  @IsArray()
  webhookUrls: string[];
}
