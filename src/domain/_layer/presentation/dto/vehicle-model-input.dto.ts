import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class VehicleModelInputDto {
  @IsString()
  @ApiProperty()
  brandName: string;

  @IsNumber()
  @ApiProperty()
  modelYear: number;

  @IsString()
  @ApiProperty()
  versionCode: string;
}
