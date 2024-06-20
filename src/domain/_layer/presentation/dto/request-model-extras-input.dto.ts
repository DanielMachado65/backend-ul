import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class RequestModelExtrasParams {
  @IsString()
  @ApiProperty()
  brandName: string;

  @IsInt()
  @Type(() => Number)
  @ApiProperty()
  modelYear: number;

  @IsString()
  @ApiProperty()
  versionCode: string;
}
