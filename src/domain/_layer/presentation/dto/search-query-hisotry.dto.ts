import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchHistoryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly search?: string = '';
}
