import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { VehicleBrandEntity } from 'src/domain/_entity/vehicle-brand.entity';
import { VehicleDetailedModelEntity } from 'src/domain/_entity/vehicle-detailed-model.entity';
import { VehicleModelYearEntity } from 'src/domain/_entity/vehicle-model-year.entity';
import { VehicleModelEntity } from 'src/domain/_entity/vehicle-model.entity';
import { VehicleVersionEntity } from 'src/domain/_entity/vehicle-version.entity';
import { RankingDto } from './owner-review.dto';

export class ListVehicleBrandsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleBrandEntity)
  @ApiProperty()
  brands: ReadonlyArray<VehicleBrandEntity>;
}

export class ListVehicleModelsDto {
  @IsString()
  @ApiProperty()
  brand: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleModelEntity)
  @ApiProperty()
  models: ReadonlyArray<VehicleModelEntity>;
}

export class ListVehicleModelYearsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleModelYearEntity)
  @ApiProperty()
  modelYears: ReadonlyArray<VehicleModelYearEntity>;
}

export class ListVehicleDetailedModelsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleDetailedModelEntity)
  @ApiProperty()
  detailedModels: ReadonlyArray<VehicleDetailedModelEntity>;
}

export class ListVehicleVersionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleVersionEntity)
  @ApiProperty()
  versions: ReadonlyArray<VehicleVersionEntity>;
}

export class ListVehicleVersionsByPlateVehicleVersionsDto {
  @IsString()
  @ApiProperty()
  fipeId: string;

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

export class ListVehicleVersionsByPlateDto {
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
  @Type(() => ListVehicleVersionsByPlateVehicleVersionsDto)
  @ApiProperty({ type: [ListVehicleVersionsByPlateVehicleVersionsDto] })
  vehicleVersions: ReadonlyArray<ListVehicleVersionsByPlateVehicleVersionsDto>;
}

export class VehicleBasicDataDto {
  @IsString()
  @ApiProperty()
  brandName: string;

  @IsString()
  @ApiProperty()
  brandImage: string;

  @IsString()
  @ApiProperty()
  modelName: string;

  @IsNumber()
  @ApiProperty()
  modelYear: number;

  @IsString()
  @ApiProperty()
  detailedModel: string;

  @IsBoolean()
  @ApiProperty()
  hasAnyReviewWithLikes: boolean;

  @IsString()
  @ApiProperty()
  averageRanking: RankingDto;
}

export class VehicleBasicDataV2Dto {
  @IsString()
  @ApiProperty()
  brandName: string;

  @IsString()
  @ApiProperty()
  brandImage: string;

  @IsString()
  @ApiProperty()
  modelName: string;

  @IsNumber()
  @ApiProperty()
  modelYear: number;

  @IsString()
  @ApiProperty()
  versionName: string;

  @IsBoolean()
  @ApiProperty()
  hasAnyReviewWithLikes: boolean;

  @IsString()
  @ApiProperty()
  averageRanking: RankingDto;
}

export class VehiclePreviewDto {
  @IsString()
  @ApiProperty()
  modelName: string;

  @IsNumber()
  @ApiProperty()
  avgTotal: number;

  @IsString()
  @ApiProperty()
  reviewsCount: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  brandImage: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty()
  modelImage: string | null;
}
