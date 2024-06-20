import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SubscriptionRelatedDataDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  plate?: string;
}
