import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class VehicleSelectableOption {
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
  detailedModel: string;
}

export class VehicleVersionSelectableOption {
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
  fipeCode: string;
}

export class VehicleBasicInfoDto {
  @IsString()
  @ApiProperty()
  brandName: string;

  @IsString()
  @ApiProperty()
  modelName: string;

  @IsNumber()
  @ApiProperty()
  modelYear: number;

  @IsNumber()
  @ApiProperty()
  brandYear: number;

  @IsString()
  @ApiProperty()
  versionName: string;

  @IsString()
  @ApiProperty()
  fipeId: string;

  @IsNumber()
  @ApiProperty()
  codModelBrand: number;
}
