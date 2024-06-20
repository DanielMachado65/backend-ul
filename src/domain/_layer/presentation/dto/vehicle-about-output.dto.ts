import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, ValidateNested, IsArray } from 'class-validator';

export class ListVehicleVersionsByPlateVehicleVersionsOutputDto {
  @IsString()
  @ApiProperty()
  versionCode: string;

  @IsString()
  @ApiProperty()
  brandName: string;

  @IsString()
  @ApiProperty()
  modelName: string;

  @IsString()
  @ApiProperty()
  versionName: string;
}

export class ListVehicleVersionsByPlateOutputDto {
  @IsNumber()
  @ApiProperty()
  brandYear: number;

  @IsNumber()
  @ApiProperty()
  modelYear: number;

  @IsString()
  @ApiProperty()
  codModelBrand: string;

  @ValidateNested({ each: true })
  @Type(() => ListVehicleVersionsByPlateVehicleVersionsOutputDto)
  @ApiProperty({ type: [ListVehicleVersionsByPlateVehicleVersionsOutputDto] })
  vehicleVersions: ReadonlyArray<ListVehicleVersionsByPlateVehicleVersionsOutputDto>;
}

export class VersionsListVehicleVersionsOutputDto {
  @IsString()
  @ApiProperty()
  versionCode: string;

  @IsString()
  @ApiProperty()
  versionName: string;
}

export class ListVehicleVersionsOutputDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VersionsListVehicleVersionsOutputDto)
  @ApiProperty()
  versions: ReadonlyArray<VersionsListVehicleVersionsOutputDto>;
}
