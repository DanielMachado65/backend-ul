import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsString } from 'class-validator';

export class WhenUserDeletedDto {
  @IsString()
  @IsISO8601()
  @ApiProperty()
  date: string;

  @IsBoolean()
  @ApiProperty()
  hasImportantData: boolean;
}
