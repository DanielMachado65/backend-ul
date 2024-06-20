import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VehicleVersionSelectableOptionOutputDto {
  @ApiProperty()
  @IsString()
  brandName: string;

  @ApiProperty()
  @IsString()
  modelName: string;

  @ApiProperty()
  @IsString()
  modelYear: number;

  @ApiProperty()
  @IsString()
  versionName: string;

  @ApiProperty()
  @IsString()
  versionCode: string;
}
