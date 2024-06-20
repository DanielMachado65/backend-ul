import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString } from 'class-validator';

export class AnalyticsEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  link: string;

  @ApiProperty()
  @IsString()
  placa: string;

  @ApiProperty()
  @IsString()
  queryId: string;

  @ApiProperty()
  @IsISO8601()
  deletedAt: string;
}
